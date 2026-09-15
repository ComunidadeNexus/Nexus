import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck, Zap } from "lucide-react";
import { formatCpf, isValidCpf } from "@/lib/cpf";
import { submitIdentityCpf } from "@/lib/submitIdentity";
import { useIdentityStatus } from "@/hooks/useIdentityStatus";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";

const schema = z.object({
  cpf: z.string().refine(isValidCpf, "CPF inválido"),
});

type FormData = z.infer<typeof schema>;

const VerificarIdentidade = () => {
  const { verified, loading, refetch } = useIdentityStatus();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { cpf: "" },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (verified) {
    return <Navigate to="/comunidade" replace />;
  }

  const onSubmit = async (data: FormData) => {
    setIsSaving(true);
    const { error } = await submitIdentityCpf(data.cpf);
    setIsSaving(false);
    if (error) {
      toast({ variant: "destructive", title: "Não foi possível verificar", description: error });
      return;
    }
    toast({ title: "Identidade verificada", description: "Agora você já pode usar a comunidade." });
    await refetch();
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "-3s" }}
        />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="glass-card p-8 rounded-2xl">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Zap className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold gradient-text">Nexus</span>
          </div>

          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-xl font-semibold">Verificar identidade</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Informe um CPF válido. Ele fica único na Nexus: guardamos só um código e os 4 últimos
              dígitos, nunca o número completo.
            </p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                inputMode="numeric"
                autoComplete="off"
                placeholder="000.000.000-00"
                value={form.watch("cpf")}
                onChange={(e) =>
                  form.setValue("cpf", formatCpf(e.target.value), { shouldValidate: true })
                }
              />
              {form.formState.errors.cpf && (
                <p className="text-sm text-destructive">{form.formState.errors.cpf.message}</p>
              )}
            </div>

            <Button type="submit" variant="gradient" className="w-full" size="lg" disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar CPF"}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Ao continuar você concorda com as{" "}
            <Link to="/regras" className="text-primary hover:underline">
              Regras da Comunidade
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerificarIdentidade;
