import { supabase } from "@/integrations/supabase/client";
import { cpfDigits } from "@/lib/cpf";

export async function submitIdentityCpf(cpf: string): Promise<{ error: string | null }> {
  const digits = cpfDigits(cpf);
  const { data, error } = await supabase.functions.invoke("verify-identity", {
    body: { cpf: digits },
  });

  if (error) {
    const context = (error as { context?: Response }).context;
    if (context && typeof context.json === "function") {
      try {
        const payload = await context.json();
        if (payload?.error && typeof payload.error === "string") {
          return { error: payload.error };
        }
      } catch {
        /* use fallback */
      }
    }
    return { error: error.message || "Não foi possível verificar o CPF." };
  }

  if (data?.error) {
    return { error: String(data.error) };
  }

  return { error: null };
}
