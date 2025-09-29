import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-CONNECT-CALLBACK] ${step}${detailsStr}`);
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

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Exchange the authorization code for access token
    const response = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code: code,
    });

    logStep("Received Stripe OAuth response", { 
      stripeUserId: response.stripe_user_id,
      scope: response.scope 
    });

    // Update the user's profile with the Stripe account information
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        stripe_account_id: response.stripe_user_id,
        stripe_account_status: 'connected'
      })
      .eq('user_id', user.id);

    if (updateError) {
      logStep("Error updating profile", { error: updateError });
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }

    logStep("Successfully connected Stripe account");

    return new Response(JSON.stringify({ 
      success: true,
      stripe_account_id: response.stripe_user_id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe-connect-callback", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});