import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

// Mapping from package IDs to coin amounts
const PACKAGE_COINS_MAP: Record<string, { coins: number; bonus: number }> = {
  "6e0f5eae-c98a-4a40-bbc7-7b75848f0b2a": { coins: 100, bonus: 0 }, // Iniciante
  "49be32b4-b7d3-483c-88d5-60b30f771a4c": { coins: 500, bonus: 50 }, // Popular
  "84282c70-a4c7-430d-a053-5f8d32971f06": { coins: 1200, bonus: 200 }, // Premium
  "c5c30b99-83b1-4b52-8cc0-a5f341155746": { coins: 3000, bonus: 600 }, // Elite
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    let event: Stripe.Event;

    // Verify webhook signature if secret is configured
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        logStep("Webhook signature verified");
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        logStep("Webhook signature verification failed", { error: errorMessage });
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      // For development, parse without verification
      event = JSON.parse(body);
      logStep("Webhook parsed without signature verification (dev mode)");
    }

    logStep("Event received", { type: event.type, id: event.id });

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.payment_status === "paid") {
        const userId = session.metadata?.user_id;
        const packageId = session.metadata?.package_id;

        if (!userId || !packageId) {
          logStep("Missing metadata", { userId, packageId });
          return new Response(JSON.stringify({ error: "Missing metadata" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const packageInfo = PACKAGE_COINS_MAP[packageId];
        if (!packageInfo) {
          logStep("Unknown package", { packageId });
          return new Response(JSON.stringify({ error: "Unknown package" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const totalCoins = packageInfo.coins + packageInfo.bonus;
        logStep("Processing coin credit", { userId, packageId, totalCoins });

        // Initialize Supabase with service role key for admin operations
        const supabaseAdmin = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
          { auth: { persistSession: false } },
        );

        // Use the process_coin_transaction function to add coins
        const { data, error } = await supabaseAdmin.rpc("process_coin_transaction", {
          p_user_id: userId,
          p_amount: totalCoins,
          p_type: "purchase",
          p_description: `Compra de pacote: ${totalCoins} Nexus Coins`,
          p_reference_id: session.id,
          p_reference_type: "stripe_checkout",
        });

        if (error) {
          logStep("Error crediting coins", { error: error.message });
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        logStep("Coins credited successfully", { userId, totalCoins, transactionResult: data });
      }
    }

    return new Response(JSON.stringify({ received: true }), {
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
