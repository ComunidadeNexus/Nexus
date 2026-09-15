import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const REPEATED = new Set([
  "00000000000",
  "11111111111",
  "22222222222",
  "33333333333",
  "44444444444",
  "55555555555",
  "66666666666",
  "77777777777",
  "88888888888",
  "99999999999",
]);

function cpfDigits(value: unknown): string {
  return String(value || "").replace(/\D/g, "");
}

function verifierDigit(digits: string, factorStart: number): number {
  let sum = 0;
  for (let i = 0; i < factorStart - 1; i += 1) {
    sum += Number(digits[i]) * (factorStart - i);
  }
  const mod = (sum * 10) % 11;
  return mod === 10 ? 0 : mod;
}

function isValidCpf(digits: string): boolean {
  if (digits.length !== 11) return false;
  if (REPEATED.has(digits)) return false;
  if (verifierDigit(digits, 10) !== Number(digits[9])) return false;
  if (verifierDigit(digits, 11) !== Number(digits[10])) return false;
  return true;
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
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Não autorizado" }, 401);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    const token = authHeader.replace(/^Bearer\s+/i, "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    const userId = userData.user?.id;
    if (userError || !userId) return json({ error: "Não autorizado" }, 401);

    const body = await req.json().catch(() => ({}));
    const digits = cpfDigits(body?.cpf);
    if (!isValidCpf(digits)) {
      return json({ error: "CPF inválido." }, 400);
    }

    const secret =
      Deno.env.get("IDENTITY_HMAC_SECRET") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    if (!secret) return json({ error: "Verificação indisponível." }, 500);

    const cpfHash = await hmacSha256Hex(secret, digits);
    const last4 = digits.slice(-4);

    const { data: hashOwner, error: hashError } = await supabaseAdmin
      .from("identity_verifications")
      .select("user_id, status")
      .eq("cpf_hash", cpfHash)
      .maybeSingle();
    if (hashError) {
      console.error("[VERIFY-IDENTITY] hash lookup failed");
      return json({ error: "Não foi possível verificar o CPF." }, 500);
    }
    if (hashOwner && hashOwner.user_id !== userId) {
      return json({ error: "Este CPF já está vinculado a outra conta." }, 409);
    }

    const { data: existing, error: existingError } = await supabaseAdmin
      .from("identity_verifications")
      .select("user_id, cpf_hash, status")
      .eq("user_id", userId)
      .maybeSingle();
    if (existingError) {
      console.error("[VERIFY-IDENTITY] user lookup failed");
      return json({ error: "Não foi possível verificar o CPF." }, 500);
    }
    if (existing && existing.cpf_hash !== cpfHash) {
      return json({ error: "Esta conta já tem um CPF verificado." }, 409);
    }
    if (existing && existing.cpf_hash === cpfHash) {
      return json({ ok: true, status: existing.status, cpf_last4: last4 });
    }

    let status: "checksum_verified" | "bureau_verified" = "checksum_verified";
    const apiKey = Deno.env.get("IDENTITY_API_KEY");
    const apiUrl = Deno.env.get("IDENTITY_API_URL");
    if (apiKey && apiUrl) {
      const bureauRes = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ cpf: digits }),
      });
      if (!bureauRes.ok) {
        return json({ error: "Não foi possível confirmar este CPF." }, 400);
      }
      status = "bureau_verified";
    }

    const { error: upsertError } = await supabaseAdmin.from("identity_verifications").insert({
      user_id: userId,
      cpf_hash: cpfHash,
      cpf_last4: last4,
      status,
    });
    if (upsertError) {
      if (upsertError.code === "23505") {
        return json({ error: "Este CPF já está vinculado a outra conta." }, 409);
      }
      console.error("[VERIFY-IDENTITY] insert failed", upsertError.code);
      return json({ error: "Não foi possível salvar a verificação." }, 500);
    }

    return json({ ok: true, status, cpf_last4: last4 });
  } catch (_error) {
    console.error("[VERIFY-IDENTITY] ERROR");
    return json({ error: "Erro interno" }, 500);
  }
});
