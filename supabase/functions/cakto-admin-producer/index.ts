import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

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

const ALLOWED = new Set(["pending", "under_review", "approved", "rejected", "suspended"]);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Não autorizado" }, 401);

  const admin = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userError } = await admin.auth.getUser(authHeader.replace(/^Bearer\s+/i, ""));
  const adminId = userData.user?.id;
  if (userError || !adminId) return json({ error: "Não autorizado" }, 401);

  const { data: isAdmin } = await admin.rpc("has_role", { _user_id: adminId, _role: "admin" });
  if (!isAdmin) return json({ error: "Só admin pode revisar produtores." }, 403);

  const body = await req.json().catch(() => ({}));
  if (body?.action === "SET_PLATFORM_FEE") {
    const percentage = Number(body?.percentage);
    if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
      return json({ error: "Comissão inválida." }, 400);
    }
    const { data: existing } = await admin
      .from("system_settings")
      .select("id")
      .eq("key", "platform_fee_percentage")
      .maybeSingle();
    if (existing) {
      const { error } = await admin
        .from("system_settings")
        .update({ value: percentage, updated_at: new Date().toISOString() })
        .eq("key", "platform_fee_percentage");
      if (error) return json({ error: "Não foi possível salvar a comissão." }, 500);
    } else {
      const { error } = await admin.from("system_settings").insert({
        key: "platform_fee_percentage",
        value: percentage,
      });
      if (error) return json({ error: "Não foi possível salvar a comissão." }, 500);
    }
    await admin.from("audit_logs").insert({
      admin_id: adminId,
      action: "SET_PLATFORM_FEE",
      details: { percentage },
    });
    return json({ ok: true, percentage });
  }

  const userId = typeof body?.user_id === "string" ? body.user_id : "";
  const status = typeof body?.status === "string" ? body.status : "";
  const notes = typeof body?.notes === "string" ? body.notes : null;
  if (!userId || !ALLOWED.has(status)) return json({ error: "Dados inválidos." }, 400);

  const { error } = await admin
    .from("profiles")
    .update({
      producer_status: status,
      is_producer: status === "approved",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
  if (error) return json({ error: "Não foi possível atualizar o status." }, 500);

  if (notes) {
    await admin.from("producer_profiles").update({ review_notes: notes, updated_at: new Date().toISOString() }).eq("user_id", userId);
  }

  await admin.from("audit_logs").insert({
    admin_id: adminId,
    action: "SET_PRODUCER_STATUS",
    target_id: userId,
    details: { status, notes: notes ? "set" : null },
  });

  return json({ ok: true, producer_status: status, is_producer: status === "approved" });
});
