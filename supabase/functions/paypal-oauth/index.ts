import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAYPAL-OAUTH] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

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
    if (!clientId) throw new Error("PAYPAL_CLIENT_ID is not set");

    const origin = req.headers.get("origin") || "http://localhost:3000";
    const redirectUri = `${origin}/paypal-callback`;
    
    // Generate a random state parameter for security
    const state = crypto.randomUUID();
    
    // Update user status to connecting
    await supabaseClient
      .from('profiles')
      .update({ 
        paypal_account_status: 'connecting'
      })
      .eq('user_id', user.id);

    // PayPal OAuth URL for production - use sandbox for testing
    const paypalBaseUrl = "https://www.sandbox.paypal.com"; // Change to https://www.paypal.com for production
    const scopes = "openid profile email https://uri.paypal.com/services/paypalattributes";
    
    const paypalOAuthUrl = `${paypalBaseUrl}/signin/authorize?client_id=${clientId}&response_type=code&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
    
    logStep("Generated PayPal OAuth URL", { url: paypalOAuthUrl });

    return new Response(JSON.stringify({ 
      url: paypalOAuthUrl,
      state 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in paypal-oauth", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});