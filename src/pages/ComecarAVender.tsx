import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatCpf, isValidCpf } from "@/lib/cpf";
import { producerStatusLabel, useProducer } from "@/hooks/useProducer";

const ComecarAVender = () => {
  const { producerStatus, isProducer, loading, refetch } = useProducer();
  const { toast } = useToast();
  const [step, setStep] = useState<"intro" | "form">("intro");
  const [saving, setSaving] = useState(false);
  const [producerType, setProducerType] = useState<"individual" | "company">("individual");
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [cpf, setCpf] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [terms, setTerms] = useState(false);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isProducer) {
    return <Navigate to="/produtor" replace />;
  }

  const submit = async () => {
    if (producerType === "individual" && !isValidCpf(cpf)) {
      toast({ variant: "destructive", title: "CPF inválido" });
      return;
    }
    if (producerType === "company" && cnpj.replace(/\D/g, "").length !== 14) {
      toast({ variant: "destructive", title: "CNPJ inválido" });
      return;
    }
    if (!fullName.trim() || !terms) {
      toast({ variant: "destructive", title: "Preencha nome e aceite os termos." });
      return;
    }
    setSaving(true);
    const { data, error } = await supabase.functions.invoke("cakto-producer-apply", {
      body: {
        producer_type: producerType,
        full_name: fullName,
        business_name: businessName,
        cpf: producerType === "individual" ? cpf : undefined,
        cnpj: producerType === "company" ? cnpj : undefined,
        phone,
        email,
        pix_key: pixKey,
        terms_accepted: true,
      },
    });
    setSaving(false);
    if (error || data?.error) {
      toast({ variant: "destructive", title: "Não foi possível enviar", description: data?.error || error?.message });
      return;
    }
    toast({ title: "Cadastro enviado", description: "Vamos analisar sua conta de produtor." });
    await refetch();
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Store className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Começar a vender</h1>
          <p className="text-sm text-muted-foreground">{producerStatusLabel(producerStatus)}</p>
        </div>
      </div>

      {producerStatus === "pending" || producerStatus === "under_review" ? (
        <p className="text-muted-foreground">
          Seu pedido já está registrado. Quando for aprovado, o Painel do Produtor aparece no menu.
        </p>
      ) : producerStatus === "suspended" ? (
        <p className="text-muted-foreground">Esta conta de produtor está suspensa. Fale com o suporte da Nexus.</p>
      ) : step === "intro" ? (
        <div className="space-y-6">
          <p className="text-muted-foreground leading-relaxed">
            Venda cursos, conteúdos, produtos digitais e outros produtos permitidos dentro da Nexus.
          </p>
          <Button variant="gradient" size="lg" onClick={() => setStep("form")}>
            Quero ser produtor
          </Button>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <div className="flex gap-2">
            <Button type="button" variant={producerType === "individual" ? "default" : "outline"} onClick={() => setProducerType("individual")}>
              Pessoa física
            </Button>
            <Button type="button" variant={producerType === "company" ? "default" : "outline"} onClick={() => setProducerType("company")}>
              Pessoa jurídica
            </Button>
          </div>
          <div className="space-y-2">
            <Label>Nome completo</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          {producerType === "company" && (
            <div className="space-y-2">
              <Label>Razão social</Label>
              <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
            </div>
          )}
          {producerType === "individual" ? (
            <div className="space-y-2">
              <Label>CPF</Label>
              <Input value={cpf} onChange={(e) => setCpf(formatCpf(e.target.value))} placeholder="000.000.000-00" />
            </div>
          ) : (
            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input value={cnpj} onChange={(e) => setCnpj(e.target.value.replace(/\D/g, "").slice(0, 14))} />
            </div>
          )}
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Chave PIX</Label>
            <Input value={pixKey} onChange={(e) => setPixKey(e.target.value)} autoComplete="off" />
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
            Aceito os termos de venda da Nexus e da Cakto.
          </label>
          <Button type="submit" variant="gradient" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar cadastro"}
          </Button>
        </form>
      )}
    </div>
  );
};

export default ComecarAVender;
