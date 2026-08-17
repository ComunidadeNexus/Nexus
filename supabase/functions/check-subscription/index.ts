import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Mapping from Stripe price IDs to plan tiers
const PRICE_TO_TIER: Record<string, string> = {
  "price_1SrTwR3IPsxMfkAmFixzQKIr": "pro",      // Pro Mensal
  "price_1SrTwf3IPsxMfkAmsK5cnsUa": "pro",      // Pro Anual
  "price_1SrTx03IPsxMfkAmNRiws412": "enterprise", // Enterprise Mensal
  "price_1SrTxI3IPsxMfkAmLd0aCvUU": "enterprise", // Enterprise Anual
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Safe date conversion from Unix timestamp
const safeTimestampToISO = (timestamp: number | null | undefined): string | null => {
  if (timestamp === null || timestamp === undefined) {
    return null;
  }
  try {
    const date = new Date(timestamp * 1000);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return null;
    }
    return date.toISOString();
  } catch {
    return null;
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No Stripe customer found");
      return new Response(JSON.stringify({ 
        subscribed: false,
        tier: "free",
        subscription_end: null,
        cancel_at_period_end: false
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      // Check for canceled but still active subscriptions
      const canceledSubs = await stripe.subscriptions.list({
        customer: customerId,
        status: "canceled",
        limit: 1,
      });

      if (canceledSubs.data.length > 0) {
        const sub = canceledSubs.data[0];
        const endDateISO = safeTimestampToISO(sub.current_period_end);
        
        if (endDateISO) {
          const endDate = new Date(endDateISO);
          if (endDate > new Date()) {
            const priceId = sub.items.data[0]?.price?.id;
            const tier = PRICE_TO_TIER[priceId] || "pro";
            logStep("Found canceled but active subscription", { tier, endDate: endDateISO });
            
            return new Response(JSON.stringify({
              subscribed: true,
              tier,
              subscription_end: endDateISO,
              cancel_at_period_end: true
            }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            });
          }
        }
      }

      logStep("No active subscription found");
      return new Response(JSON.stringify({ 
        subscribed: false,
        tier: "free",
        subscription_end: null,
        cancel_at_period_end: false
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const subscription = subscriptions.data[0];
    const subscriptionEnd = safeTimestampToISO(subscription.current_period_end);
    const priceId = subscription.items.data[0]?.price?.id;
    const tier = PRICE_TO_TIER[priceId] || "pro";
    
    logStep("Active subscription found", { 
      subscriptionId: subscription.id, 
      tier,
      endDate: subscriptionEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    });

    return new Response(JSON.stringify({
      subscribed: true,
      tier,
      subscription_end: subscriptionEnd,
      cancel_at_period_end: subscription.cancel_at_period_end
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
