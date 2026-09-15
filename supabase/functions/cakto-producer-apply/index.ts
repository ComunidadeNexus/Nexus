import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { createProducerAccount } from "../_shared/cakto/service.ts";
import { CaktoSubaccountPendingError } from "../_shared/cakto/errors.ts";

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

function digits(value: unknown): string {
  return String(value || "").replace(/\D/g, "");
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
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

  const { data: identity } = await admin
    .from("identity_verifications")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!identity?.status || !["checksum_verified", "bureau_verified"].includes(identity.status)) {
    return json({ error: "Verifique sua identidade com CPF antes de vender." }, 400);
  }

  const body = await req.json().catch(() => ({}));
  const producerType = body?.producer_type === "company" ? "company" : "individual";
  const taxDigits = digits(producerType === "company" ? body?.cnpj : body?.cpf);
  if (producerType === "individual" && taxDigits.length !== 11) return json({ error: "CPF inválido." }, 400);
  if (producerType === "company" && taxDigits.length !== 14) return json({ error: "CNPJ inválido." }, 400);
  if (!body?.terms_accepted) return json({ error: "Aceite os termos para continuar." }, 400);

  const secret = Deno.env.get("IDENTITY_HMAC_SECRET") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const taxHash = await hmacSha256Hex(secret, taxDigits);

  const { error: profileError } = await admin.from("producer_profiles").upsert(
    {
      user_id: user.id,
      producer_type: producerType,
      full_name: String(body?.full_name || "").trim(),
      business_name: producerType === "company" ? String(body?.business_name || "").trim() : null,
      tax_id_type: producerType === "company" ? "cnpj" : "cpf",
      tax_id_hash: taxHash,
      tax_id_last4: taxDigits.slice(-4),
      birth_date: body?.birth_date || null,
      phone: String(body?.phone || "").trim() || null,
      email: String(body?.email || user.email || "").trim(),
      address: String(body?.address || "").trim() || null,
      city: String(body?.city || "").trim() || null,
      state: String(body?.state || "").trim() || null,
      postal_code: digits(body?.postal_code) || null,
      pix_key: String(body?.pix_key || "").trim() || null,
      bank_data: body?.bank_data && typeof body.bank_data === "object" ? body.bank_data : {},
      document_status: "pending",
      kyc_status: "pending",
      terms_accepted_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (profileError) {
    console.error("[CAKTO-PRODUCER-APPLY] upsert failed", profileError.code);
    return json({ error: "Não foi possível salvar o cadastro." }, 500);
  }

  await admin
    .from("profiles")
    .update({ producer_status: "pending", is_producer: false, updated_at: new Date().toISOString() })
    .eq("user_id", user.id);

  let subaccount: { skipped: true; reason: string } | Record<string, unknown> = {
    skipped: true,
    reason: "Endpoint oficial de subconta Cakto pendente de confirmação.",
  };
  try {
    await createProducerAccount({ user_id: user.id });
  } catch (error) {
    if (!(error instanceof CaktoSubaccountPendingError)) {
      console.error("[CAKTO-PRODUCER-APPLY] subaccount");
    }
    subaccount = { skipped: true, reason: error instanceof Error ? error.message : "subaccount pending" };
  }

  return json({ ok: true, producer_status: "pending", subaccount });
});
