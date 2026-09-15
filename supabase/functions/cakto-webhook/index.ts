import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { isFromCakto } from "../_shared/cakto/webhooks.ts";
import { firstOrderData, webhookEventId, type CaktoWebhookEnvelope } from "../_shared/cakto/types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cakto-timestamp, x-cakto-signature",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function redactPayload(payload: CaktoWebhookEnvelope): CaktoWebhookEnvelope {
  const clone = structuredClone(payload);
  delete clone.secret;
  const redact = (row: Record<string, unknown> | undefined) => {
    if (!row) return;
    const customer = row.customer as Record<string, unknown> | undefined;
    if (customer) {
      delete customer.docNumber;
      delete customer.docType;
    }
  };
  if (Array.isArray(clone.data)) clone.data.forEach((row) => redact(row as Record<string, unknown>));
  else redact(clone.data as Record<string, unknown> | undefined);
  return clone;
}

function asNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const rawBody = await req.text();
  const timestamp = req.headers.get("x-cakto-timestamp");
  const signature = req.headers.get("x-cakto-signature");

  let envelope: CaktoWebhookEnvelope;
  try {
    envelope = JSON.parse(rawBody) as CaktoWebhookEnvelope;
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  const authentic = await isFromCakto(rawBody, timestamp, signature, envelope.secret);
  if (!authentic) return json({ error: "unauthorized" }, 401);

  const event = envelope.event || "unknown";
  const order = firstOrderData(envelope.data);
  const eventId = webhookEventId(event, order);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const { data: existing } = await admin
    .from("payment_webhook_events")
    .select("id, processed")
    .eq("provider", "cakto")
    .eq("event_id", eventId)
    .maybeSingle();

  if (existing?.processed) return json({ ok: true, duplicate: true });

  if (!existing) {
    const { error: insertEventError } = await admin.from("payment_webhook_events").insert({
      provider: "cakto",
      event_id: eventId,
      event_type: event,
      payload: redactPayload(envelope),
      processed: false,
    });
    if (insertEventError?.code === "23505") {
      const { data: raced } = await admin
        .from("payment_webhook_events")
        .select("processed")
        .eq("provider", "cakto")
        .eq("event_id", eventId)
        .maybeSingle();
      if (raced?.processed) return json({ ok: true, duplicate: true });
    } else if (insertEventError) {
      console.error("[CAKTO-WEBHOOK] persist failed");
      return json({ error: "persist failed" }, 500);
    }
  }

  try {
    await processEvent(admin, event, order);
    await admin
      .from("payment_webhook_events")
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq("provider", "cakto")
      .eq("event_id", eventId);
  } catch (error) {
    console.error("[CAKTO-WEBHOOK] process failed", error instanceof Error ? error.message : "");
    return json({ error: "process failed" }, 500);
  }

  return json({ ok: true });
});

async function findOrder(
  admin: ReturnType<typeof createClient>,
  order: ReturnType<typeof firstOrderData>,
) {
  if (!order?.id && !order?.offer?.id) return null;

  if (order?.id) {
    const byTx = await admin
      .from("orders")
      .select("*")
      .eq("payment_provider", "cakto")
      .eq("provider_transaction_id", order.id)
      .maybeSingle();
    if (byTx.data) return byTx.data;
  }

  const offerId = order?.offer?.id || null;
  const email = order?.customer?.email?.toLowerCase() || null;
  if (!offerId) return null;

  let query = admin
    .from("orders")
    .select("*")
    .eq("payment_provider", "cakto")
    .eq("provider_offer_id", offerId)
    .eq("payment_status", "pending")
    .order("created_at", { ascending: true })
    .limit(1);
  if (email) query = query.eq("buyer_email", email);
  const found = await query.maybeSingle();
  return found.data;
}

async function processEvent(
  admin: ReturnType<typeof createClient>,
  event: string,
  order: ReturnType<typeof firstOrderData>,
) {
  if (!order?.id && !order?.subscription?.id) return;

  const orderStatus: Record<string, string> = {
    purchase_approved: "paid",
    subscription_created: "paid",
    subscription_renewed: "paid",
    purchase_refused: "failed",
    refund: "refunded",
    chargeback: "chargeback",
    pix_gerado: "pending",
    boleto_gerado: "pending",
    subscription_canceled: "canceled",
  };

  const row = await findOrder(admin, order);
  const paymentStatus = orderStatus[event];

  if (row && paymentStatus && row.payment_status !== paymentStatus) {
    await admin
      .from("orders")
      .update({
        payment_status: paymentStatus,
        provider_transaction_id: order?.id || row.provider_transaction_id,
        provider_subscription_id: order?.subscription?.id
          ? String(order.subscription.id)
          : row.provider_subscription_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
  }

  const paidEvents = new Set(["purchase_approved", "subscription_created", "subscription_renewed"]);
  if (row && paidEvents.has(event) && row.product_id) {
    await admin.from("product_entitlements").upsert(
      { user_id: row.buyer_id, product_id: row.product_id, order_id: row.id },
      { onConflict: "user_id,product_id" },
    );

    const { data: feeRow } = await admin
      .from("system_settings")
      .select("value")
      .eq("key", "platform_fee_percentage")
      .maybeSingle();
    const feePct = asNumber(feeRow?.value) || 10;
    const gross = asNumber(order?.amount ?? row.amount);
    const gatewayFee = asNumber(order?.fees);
    const platformFee = Math.round(gross * (feePct / 100) * 100) / 100;
    const fromCakto = order?.commissions?.find((c) => c.type === "producer")?.totalAmount;
    const producerAmount =
      typeof fromCakto === "number" ? fromCakto : Math.max(0, gross - gatewayFee - platformFee);

    const { error: txError } = await admin.from("producer_transactions").insert({
      producer_id: row.seller_id,
      order_id: row.id,
      gross_amount: gross,
      gateway_fee: gatewayFee,
      platform_fee: platformFee,
      producer_amount: producerAmount,
      status: "confirmed",
      provider_transaction_id: order?.id || null,
    });
    if (txError && txError.code !== "23505") throw txError;
  }

  if (row && (event === "refund" || event === "chargeback") && row.product_id) {
    await admin.from("product_entitlements").delete().eq("order_id", row.id);
    await admin
      .from("producer_transactions")
      .update({ status: event === "refund" ? "refunded" : "chargeback" })
      .eq("order_id", row.id);
  }

  const subId = order?.subscription?.id ? String(order.subscription.id) : row?.provider_subscription_id;
  if (!subId) return;

  if (event === "subscription_created" || event === "subscription_renewed") {
    const planId = row?.plan_id;
    const userId = row?.buyer_id;
    if (!planId || !userId) return;
    const { data: plan } = await admin
      .from("plans")
      .select("cakto_offer_id_yearly")
      .eq("id", planId)
      .maybeSingle();
    const yearly = Boolean(plan?.cakto_offer_id_yearly && plan.cakto_offer_id_yearly === row.provider_offer_id);
    const start = new Date();
    const end = new Date(start);
    if (yearly) end.setFullYear(end.getFullYear() + 1);
    else end.setDate(end.getDate() + 32);
    await admin.from("subscriptions").upsert(
      {
        user_id: userId,
        plan_id: planId,
        status: "active",
        interval: yearly ? "yearly" : "monthly",
        provider: "cakto",
        provider_subscription_id: subId,
        current_period_start: start.toISOString(),
        current_period_end: end.toISOString(),
        cancel_at_period_end: false,
        updated_at: start.toISOString(),
      },
      { onConflict: "provider,provider_subscription_id" },
    );
  }

  if (event === "subscription_canceled") {
    await admin
      .from("subscriptions")
      .update({ status: "canceled", cancel_at_period_end: true, updated_at: new Date().toISOString() })
      .eq("provider", "cakto")
      .eq("provider_subscription_id", subId);
  }

  if (event === "subscription_renewal_refused" || event === "subscription_late") {
    await admin
      .from("subscriptions")
      .update({ status: "past_due", updated_at: new Date().toISOString() })
      .eq("provider", "cakto")
      .eq("provider_subscription_id", subId);
  }
}
