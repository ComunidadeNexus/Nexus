import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { caktoConfigured, checkoutUrlForOffer, createProduct, resolveOfferId } from "../_shared/cakto/service.ts";

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
  const { data: userData, error: userError } = await admin.auth.getUser(authHeader.replace(/^Bearer\s+/i, ""));
  const user = userData.user;
  if (userError || !user) return json({ error: "Não autorizado" }, 401);

  const { data: isProducer } = await admin.rpc("is_approved_producer", { _user_id: user.id });
  if (!isProducer) return json({ error: "Só produtores aprovados podem publicar." }, 403);

  const body = await req.json().catch(() => ({}));
  const title = String(body?.title || "").trim();
  const description = String(body?.description || "").trim();
  const price = Number(body?.price);
  if (title.length < 3 || !Number.isFinite(price) || price < 0) {
    return json({ error: "Informe título e preço válidos." }, 400);
  }

  const { data: product, error: insertError } = await admin
    .from("producer_products")
    .insert({
      producer_id: user.id,
      title,
      description,
      price,
      currency: "BRL",
      status: caktoConfigured() ? "pending" : "draft",
    })
    .select("id")
    .single();
  if (insertError || !product) return json({ error: "Não foi possível criar o produto." }, 500);

  if (!caktoConfigured()) {
    return json({
      ok: true,
      product_id: product.id,
      status: "draft",
      warning: "Cakto ainda não está configurada. O produto ficou em rascunho.",
    });
  }

  const origin = req.headers.get("origin") || "https://comunidadenexus.com";
  try {
    const created = await createProduct({
      name: title,
      description: description || title,
      price,
      type: "unique",
      salesPage: `${origin}/produtos/${product.id}`,
    });
    const caktoProductId = created.id || "";
    const offerId = caktoProductId ? await resolveOfferId(created, caktoProductId) : created.offers?.[0]?.id || null;
    await admin
      .from("producer_products")
      .update({
        status: offerId ? "active" : "pending",
        cakto_product_id: caktoProductId || null,
        cakto_offer_id: offerId,
        checkout_url: offerId ? checkoutUrlForOffer(offerId) : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", product.id);
    return json({ ok: true, product_id: product.id, cakto_product_id: caktoProductId, cakto_offer_id: offerId });
  } catch (error) {
    console.error("[CAKTO-PUBLISH] create product failed", error instanceof Error ? error.message : "");
    return json({ error: "Cakto recusou a criação do produto." }, 502);
  }
});
