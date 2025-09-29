import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAYPAL-CALLBACK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    const { code, state, error } = await req.json();
    
    if (error) {
      logStep("OAuth error received", { error });
      throw new Error(`OAuth error: ${error}`);
    }

    if (!code) {
      throw new Error("No authorization code received");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.id) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
    
    if (!clientId || !clientSecret) {
      throw new Error("PayPal credentials are not set");
    }

    // Exchange authorization code for access token
    const tokenUrl = "https://api-m.sandbox.paypal.com/v1/oauth2/token"; // Change to https://api-m.paypal.com for production
    
    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Accept-Language": "en_US",
        "Authorization": `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        "grant_type": "authorization_code",
        "code": code
      })
    });

    if (!tokenResponse.ok) {
      throw new Error(`PayPal token exchange failed: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    logStep("Received PayPal token", { scope: tokenData.scope });

    // Get user profile information
    const profileResponse = await fetch("https://api-m.sandbox.paypal.com/v1/identity/oauth2/userinfo?schema=paypalv1.1", {
      headers: {
        "Authorization": `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json"
      }
    });

    if (!profileResponse.ok) {
      throw new Error(`PayPal profile fetch failed: ${profileResponse.status}`);
    }

    const profileData = await profileResponse.json();
    logStep("Received PayPal profile", { email: profileData.email });

    // Update the user's profile with PayPal information
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        paypal_email: profileData.email,
        paypal_account_status: 'connected'
      })
      .eq('user_id', user.id);

    if (updateError) {
      logStep("Error updating profile", { error: updateError });
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }

    logStep("Successfully connected PayPal account");

    return new Response(JSON.stringify({ 
      success: true,
      paypal_email: profileData.email 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in paypal-callback", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});