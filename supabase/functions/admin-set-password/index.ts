import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    const adminId = userData.user?.id;
    if (userError || !adminId) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const { data: isAdmin, error: roleError } = await supabaseAdmin.rpc("has_role", {
      _user_id: adminId,
      _role: "admin",
    });
    if (roleError || !isAdmin) {
      return new Response(JSON.stringify({ error: "Só admin pode redefinir senha" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    const body = await req.json();
    const userId = typeof body?.user_id === "string" ? body.user_id.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!UUID_RE.test(userId)) {
      return new Response(JSON.stringify({ error: "Usuário inválido" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    if (password.length < 6 || password.length > 72) {
      return new Response(
        JSON.stringify({ error: "A senha deve ter entre 6 e 72 caracteres" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password,
    });
    if (updateError) {
      console.error("[ADMIN-SET-PASSWORD] update failed", updateError.message);
      return new Response(JSON.stringify({ error: "Não foi possível redefinir a senha" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    await supabaseAdmin.from("audit_logs").insert({
      admin_id: adminId,
      action: "SET_PASSWORD",
      target_id: userId,
      details: { via: "admin-set-password" },
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    console.error("[ADMIN-SET-PASSWORD] ERROR", message);
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
