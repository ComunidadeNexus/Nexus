import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { cpfLast4 } from "../_shared/cpf.ts";
import {
  DIGITS_CHECKED_STATUS,
  IDENTITY_MESSAGES,
  OWNERSHIP_PROVIDER_TIMEOUT_MS,
  cpfFromRequestBody,
  hmacSha256Hex,
  identityHashWritesEnabled,
  interpretProviderOutcome,
  ownershipProviderEnabled,
  planCpfBind,
  readIdentityHmacSecrets,
  type CpfHashRow,
} from "../_shared/identityPolicy.ts";

// A future ownership call must abort at OWNERSHIP_PROVIDER_TIMEOUT_MS and must
// not treat a registry lookup as proof. interpretProviderOutcome refuses every
// payload until that contract is implemented here. No registry URL is read.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

type AdminClient = ReturnType<typeof createClient>;

function asHashRow(row: { user_id?: string; cpf_hash?: string } | null): CpfHashRow | null {
  if (!row?.user_id || !row.cpf_hash) return null;
  return { userId: row.user_id, cpfHash: row.cpf_hash };
}

async function loadBindState(admin: AdminClient, userId: string, candidateHashes: string[]) {
  const [{ data: userRow, error: userError }, { data: owners, error: ownerError }] =
    await Promise.all([
      admin
        .from("identity_verifications")
        .select("user_id, cpf_hash")
        .eq("user_id", userId)
        .maybeSingle(),
      admin
        .from("identity_verifications")
        .select("user_id, cpf_hash")
        .in("cpf_hash", candidateHashes),
    ]);

  if (userError || ownerError) {
    console.error("[VERIFY-IDENTITY] lookup failed", userError?.code || ownerError?.code);
    return null;
  }

  return {
    existingForUser: asHashRow(userRow),
    hashOwners: (owners ?? [])
      .map((row) => asHashRow(row))
      .filter((row): row is CpfHashRow => !!row),
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let attemptId: string | null = null;
  let admin: AdminClient | null = null;

  const finish = async (result: "accepted" | "rejected") => {
    if (!admin || !attemptId) return;
    const { error } = await admin.rpc("finish_identity_attempt", {
      p_id: attemptId,
      p_result: result,
    });
    if (error) console.error("[VERIFY-IDENTITY] attempt finish failed", error.code);
  };

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Não autorizado" }, 401);

    admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    const token = authHeader.replace(/^Bearer\s+/i, "");
    const { data: userData, error: userError } = await admin.auth.getUser(token);
    const userId = userData.user?.id;
    if (userError || !userId) return json({ error: "Não autorizado" }, 401);

    const writesEnabled = identityHashWritesEnabled({
      IDENTITY_HMAC_WRITE_MODE: Deno.env.get("IDENTITY_HMAC_WRITE_MODE"),
      IDENTITY_HMAC_SECRET: Deno.env.get("IDENTITY_HMAC_SECRET"),
    });
    if (!writesEnabled) {
      return json({ error: IDENTITY_MESSAGES.unavailable }, 503);
    }

    const secrets = readIdentityHmacSecrets({
      IDENTITY_HMAC_SECRET: Deno.env.get("IDENTITY_HMAC_SECRET"),
      IDENTITY_HMAC_SECRET_PREVIOUS: Deno.env.get("IDENTITY_HMAC_SECRET_PREVIOUS"),
    });
    if (!secrets.primary) return json({ error: IDENTITY_MESSAGES.unavailable }, 503);

    const provider = interpretProviderOutcome({});
    if (provider.proven !== false || ownershipProviderEnabled()) {
      console.error("[VERIFY-IDENTITY] refused unapproved provider", OWNERSHIP_PROVIDER_TIMEOUT_MS);
      return json({ error: IDENTITY_MESSAGES.opaque }, 503);
    }

    const { data: attemptData, error: attemptError } = await admin.rpc("begin_identity_attempt", {
      p_user_id: userId,
    });
    if (attemptError) {
      console.error("[VERIFY-IDENTITY] attempt gate failed", attemptError.code);
      return json({ error: IDENTITY_MESSAGES.opaque }, 500);
    }
    if (typeof attemptData !== "string" || attemptData.length === 0) {
      return json({ error: IDENTITY_MESSAGES.limited }, 429);
    }
    attemptId = attemptData;

    const body = await req.json().catch(() => null);
    const digits = cpfFromRequestBody(body);
    if (!digits) {
      await finish("rejected");
      return json({ error: IDENTITY_MESSAGES.invalid }, 400);
    }

    const primaryHash = await hmacSha256Hex(secrets.primary, digits);
    const previousHash = secrets.previous ? await hmacSha256Hex(secrets.previous, digits) : null;
    const candidateHashes = previousHash ? [primaryHash, previousHash] : [primaryHash];
    const loaded = await loadBindState(admin, userId, candidateHashes);
    if (!loaded) {
      await finish("rejected");
      return json({ error: IDENTITY_MESSAGES.opaque }, 500);
    }

    const plan = planCpfBind({
      userId,
      candidateHashes,
      existingForUser: loaded.existingForUser,
      hashOwners: loaded.hashOwners,
    });
    if (plan === "opaque_conflict") {
      await finish("rejected");
      return json({ error: IDENTITY_MESSAGES.opaque }, 400);
    }
    if (plan === "idempotent") {
      await finish("accepted");
      return json({ ok: true, identity: "pending", cpf_last4: cpfLast4(digits) });
    }

    const { error: insertError } = await admin.from("identity_verifications").insert({
      user_id: userId,
      cpf_hash: primaryHash,
      cpf_last4: cpfLast4(digits),
      status: DIGITS_CHECKED_STATUS,
    });
    if (insertError) {
      if (insertError.code === "23505") {
        const reloaded = await loadBindState(admin, userId, candidateHashes);
        const again = reloaded
          ? planCpfBind({
              userId,
              candidateHashes,
              existingForUser: reloaded.existingForUser,
              hashOwners: reloaded.hashOwners,
            })
          : "opaque_conflict";
        if (again === "idempotent") {
          await finish("accepted");
          return json({ ok: true, identity: "pending", cpf_last4: cpfLast4(digits) });
        }
        console.error("[VERIFY-IDENTITY] insert conflict");
        await finish("rejected");
        return json({ error: IDENTITY_MESSAGES.opaque }, 400);
      }
      console.error("[VERIFY-IDENTITY] insert failed", insertError.code);
      await finish("rejected");
      return json({ error: IDENTITY_MESSAGES.opaque }, 500);
    }

    await finish("accepted");
    return json({ ok: true, identity: "pending", cpf_last4: cpfLast4(digits) });
  } catch (_error) {
    console.error("[VERIFY-IDENTITY] ERROR");
    await finish("rejected");
    return json({ error: IDENTITY_MESSAGES.opaque }, 500);
  }
});
