import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { caktoConfigured, checkoutUrlForOffer } from "../_shared/cakto/service.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Não autorizado" }, 401);

  const admin = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  const user = userData.user;
  if (userError || !user) return json({ error: "Não autorizado" }, 401);

  const body = await req.json().catch(() => ({}));
  const productId = typeof body?.product_id === "string" ? body.product_id : "";
  const planId = typeof body?.plan_id === "string" ? body.plan_id : "";
  const interval = body?.interval === "yearly" ? "yearly" : "monthly";

  let sellerId: string | null = null;
  let offerId: string | null = null;
  let amount = 0;
  let dbProductId: string | null = null;
  let dbPlanId: string | null = null;

  if (productId) {
    const { data: product, error } = await admin
      .from("producer_products")
      .select("id, producer_id, price, status, cakto_offer_id, checkout_url")
      .eq("id", productId)
      .maybeSingle();
    if (error || !product || product.status !== "active" || !product.cakto_offer_id) {
      return json({ error: "Produto indisponível para compra." }, 400);
    }
    sellerId = product.producer_id;
    offerId = product.cakto_offer_id;
    amount = Number(product.price);
    dbProductId = product.id;
  } else if (planId) {
    const { data: plan, error } = await admin
      .from("plans")
      .select("id, price_monthly, price_yearly, cakto_offer_id_monthly, cakto_offer_id_yearly, is_active")
      .eq("id", planId)
      .maybeSingle();
    const offer = interval === "yearly" ? plan?.cakto_offer_id_yearly : plan?.cakto_offer_id_monthly;
    if (error || !plan?.is_active || !offer) {
      return json({ error: "Plano indisponível na Cakto." }, 400);
    }
    offerId = offer;
    amount = Number(interval === "yearly" ? plan.price_yearly : plan.price_monthly);
    dbPlanId = plan.id;
  } else {
    return json({ error: "Informe product_id ou plan_id." }, 400);
  }

  const checkoutUrl = checkoutUrlForOffer(offerId);
  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      buyer_id: user.id,
      seller_id: sellerId,
      product_id: dbProductId,
      plan_id: dbPlanId,
      amount,
      currency: "BRL",
      payment_status: "pending",
      payment_provider: "cakto",
      provider_offer_id: offerId,
      checkout_url: checkoutUrl,
      buyer_email: user.email?.toLowerCase() || null,
    })
    .select("id, checkout_url")
    .single();

  if (orderError || !order) {
    console.error("[CAKTO-CHECKOUT] order insert failed", orderError?.code);
    return json({ error: "Não foi possível criar o pedido." }, 500);
  }

  return json({
    order_id: order.id,
    checkout_url: order.checkout_url,
    configured: caktoConfigured(),
  });
});
