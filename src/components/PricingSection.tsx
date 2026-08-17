import { Button } from "@/components/ui/button";
import { Check, Crown, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PricingSection = () => {
  const navigate = useNavigate();

  const features = [
    "Membros ilimitados",
    "Feed com algoritmo inteligente",
    "Grupos ilimitados",
    "Gamificação completa",
    "Notificações push",
    "Moderação avançada",
    "Analytics completo",
    "Suporte prioritário",
  ];

  return (
    <section id="pricing" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
            <Crown className="w-4 h-4 text-gold" />
            <span className="text-sm text-muted-foreground">Acesso Completo</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Um plano,{' '}
            <span className="gradient-text">tudo incluso</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Tenha acesso completo a todas as funcionalidades da plataforma.
          </p>
        </div>

        {/* Single Pricing Card */}
        <div className="max-w-lg mx-auto">
          <div className="glass-card p-8 rounded-2xl relative border-primary/50 glow-primary">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-semibold">
              Acesso Total
            </div>

            <div className="flex items-center gap-3 mb-4 pt-2">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/20">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold">Nexus Pro</h3>
                <p className="text-sm text-muted-foreground">Tudo que você precisa</p>
              </div>
            </div>

            <div className="mb-6">
              <span className="font-display text-5xl font-bold">R$ 29,90</span>
              <span className="text-muted-foreground">/mês</span>
            </div>

            <ul className="space-y-3 mb-8">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <Button 
              variant="gradient" 
              className="w-full" 
              size="lg"
              onClick={() => navigate("/auth?mode=signup")}
            >
              Assinar Agora
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Cancele a qualquer momento. Sem compromisso.
            </p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground mb-4">Formas de pagamento aceitas</p>
          <div className="flex items-center justify-center gap-6 opacity-60">
            <div className="glass-card px-4 py-2 rounded-lg text-sm font-medium">PIX</div>
            <div className="glass-card px-4 py-2 rounded-lg text-sm font-medium">Cartão de Crédito</div>
            <div className="glass-card px-4 py-2 rounded-lg text-sm font-medium">Boleto</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
