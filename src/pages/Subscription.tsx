import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, Crown, Zap, Building2, Loader2, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";

const plans = [
  {
    id: "pro", // Mantendo o id "pro" para compatibilidade com o Stripe configurado, se houver
    name: "Premium",
    description: "Acesso total à Área Premium (O Cofre)",
    priceMonthly: 19.9,
    priceYearly: 199.0,
    features: [
      "Acesso ao Cofre de Downloads",
      "Ferramentas e Scripts exclusivos",
      "Vídeos e Tutoriais restritos",
      "Selo Premium no Perfil",
      "Navegação sem anúncios",
      "Suporte Prioritário",
    ],
    icon: Crown,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    popular: true,
  },
];

const Subscription = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isYearly, setIsYearly] = useState(false);
  const [subscribingTier, setSubscribingTier] = useState<string | null>(null);

  const {
    subscribed,
    tier,
    subscriptionEnd,
    cancelAtPeriodEnd,
    isLoading,
    subscribe,
    openCustomerPortal,
    checkSubscription,
  } = useSubscription();

  // Handle payment status from URL
  useEffect(() => {
    const status = searchParams.get("status");
    if (status === "success") {
      toast({
        title: "Assinatura realizada! 🎉",
        description: "Bem-vindo ao plano Premium! Aproveite todos os benefícios.",
      });
      checkSubscription();
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (status === "cancelled") {
      toast({
        title: "Assinatura cancelada",
        description: "O processo de assinatura foi cancelado.",
        variant: "destructive",
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams, toast, checkSubscription]);

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (planId === "free") return;

    setSubscribingTier(planId);
    const { error } = await subscribe(
      planId as "pro" | "enterprise",
      isYearly ? "yearly" : "monthly",
    );

    if (error) {
      toast({
        title: "Erro ao iniciar assinatura",
        description: error,
        variant: "destructive",
      });
    }
    setSubscribingTier(null);
  };

  const handleManageSubscription = async () => {
    const { error } = await openCustomerPortal();
    if (error) {
      toast({
        title: "Erro ao abrir portal",
        description: error,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 pb-24 lg:pb-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Escolha seu plano
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-3">
              Desbloqueie todo o potencial do Nexus
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Faça upgrade para acessar recursos exclusivos, conteúdo premium e muito mais.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <Label
              htmlFor="billing"
              className={!isYearly ? "font-medium" : "text-muted-foreground"}
            >
              Mensal
            </Label>
            <Switch id="billing" checked={isYearly} onCheckedChange={setIsYearly} />
            <Label htmlFor="billing" className={isYearly ? "font-medium" : "text-muted-foreground"}>
              Anual
              <Badge variant="secondary" className="ml-2 bg-green-500/20 text-green-600">
                2 meses grátis
              </Badge>
            </Label>
          </div>

          {/* Current Subscription Status */}
          {subscribed && (
            <Card className="mb-8 border-primary/50 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Crown className="w-5 h-5 text-yellow-500" />
                      <span className="font-semibold">
                        Plano {tier.charAt(0).toUpperCase() + tier.slice(1)} Ativo
                      </span>
                      {cancelAtPeriodEnd && <Badge variant="destructive">Cancela em breve</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {cancelAtPeriodEnd
                        ? `Sua assinatura termina em ${formatDate(subscriptionEnd!)}`
                        : `Próxima renovação em ${formatDate(subscriptionEnd!)}`}
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleManageSubscription}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Gerenciar Assinatura
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pricing Cards */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                {plans.map((plan) => {
                  const Icon = plan.icon;
                  const isCurrentPlan = tier === plan.id;
                  const price = isYearly ? plan.priceYearly : plan.priceMonthly;
                  const isSubscribing = subscribingTier === plan.id;

                  return (
                    <Card
                      key={plan.id}
                      className={`relative flex flex-col ${
                        plan.popular ? "border-primary shadow-lg" : ""
                      } ${isCurrentPlan ? "ring-2 ring-primary" : ""}`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Badge className="bg-primary">Mais Popular</Badge>
                        </div>
                      )}
                      {isCurrentPlan && (
                        <div className="absolute -top-3 right-4">
                          <Badge variant="secondary" className="bg-green-500 text-white">
                            Seu Plano
                          </Badge>
                        </div>
                      )}

                      <CardHeader className="text-center pb-2">
                        <div
                          className={`w-12 h-12 mx-auto rounded-xl ${plan.bgColor} flex items-center justify-center mb-3`}
                        >
                          <Icon className={`w-6 h-6 ${plan.color}`} />
                        </div>
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                      </CardHeader>

                      <CardContent className="flex-1">
                        <div className="text-center mb-6">
                          <span className="text-4xl font-bold">
                            {price === 0 ? "Grátis" : `R$ ${price.toFixed(2).replace(".", ",")}`}
                          </span>
                          {price > 0 && (
                            <span className="text-muted-foreground">
                              /{isYearly ? "ano" : "mês"}
                            </span>
                          )}
                        </div>

                        <ul className="space-y-3">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.color}`} />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>

                      <CardFooter>
                        {isCurrentPlan ? (
                          <Button
                            className="w-full"
                            variant="outline"
                            onClick={handleManageSubscription}
                            disabled={plan.id === "free"}
                          >
                            {plan.id === "free" ? "Plano Atual" : "Gerenciar"}
                          </Button>
                        ) : (
                          <Button
                            className="w-full"
                            variant={plan.popular ? "default" : "outline"}
                            onClick={() => handleSubscribe(plan.id)}
                            disabled={
                              isSubscribing || plan.id === "free" || (subscribed && tier !== "free")
                            }
                          >
                            {isSubscribing ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processando...
                              </>
                            ) : plan.id === "free" ? (
                              "Plano Básico"
                            ) : subscribed && tier !== "free" ? (
                              "Mude pelo Portal"
                            ) : (
                              `Assinar ${plan.name}`
                            )}
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* FAQ Section */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-4">Dúvidas Frequentes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-3xl mx-auto">
              <div>
                <h3 className="font-semibold mb-2">Posso cancelar a qualquer momento?</h3>
                <p className="text-sm text-muted-foreground">
                  Sim! Você pode cancelar sua assinatura quando quiser pelo Portal do Cliente. Você
                  continuará tendo acesso até o final do período pago.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Como funciona o upgrade/downgrade?</h3>
                <p className="text-sm text-muted-foreground">
                  Ao fazer upgrade, você paga apenas a diferença proporcional. No downgrade, o valor
                  é creditado para os próximos meses.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Quais formas de pagamento são aceitas?</h3>
                <p className="text-sm text-muted-foreground">
                  Aceitamos cartões de crédito (Visa, Mastercard, Amex) e boleto bancário através do
                  Stripe, nossa plataforma de pagamentos segura.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Os Nexus Coins são cumulativos?</h3>
                <p className="text-sm text-muted-foreground">
                  Sim! Os Nexus Coins que você recebe mensalmente são acumulados na sua carteira e
                  não expiram enquanto você for assinante.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Subscription;
