import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, Crown, Loader2, ExternalLink, Sparkles } from "lucide-react";
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
import { usePublicPlans, type PublicPlan } from "@/hooks/usePublicPlans";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";

const checkoutTier = (plan: PublicPlan): "pro" | "enterprise" => {
  const name = plan.name.toLowerCase();
  if (name.includes("enterprise")) return "enterprise";
  return "pro";
};

const Subscription = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isYearly, setIsYearly] = useState(false);
  const [subscribingTier, setSubscribingTier] = useState<string | null>(null);
  const { plans, isLoading: plansLoading } = usePublicPlans();
  const { hasAccess: hasPremiumAccess, loading: accessLoading } = usePremiumAccess();

  const {
    subscribed,
    tier,
    subscriptionEnd,
    cancelAtPeriodEnd,
    subscribe,
    openCustomerPortal,
    checkSubscription,
  } = useSubscription();

  const hasYearlyPrice = plans.some((plan) => plan.price_yearly > 0);

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

  const handleSubscribe = async (plan: PublicPlan) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setSubscribingTier(plan.id);
    const { error } = await subscribe(checkoutTier(plan), isYearly ? "yearly" : "monthly");

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

  const pageLoading = plansLoading || accessLoading;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 pb-24 lg:pb-8">
        <div className="max-w-5xl mx-auto">
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

          {hasYearlyPrice && (
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
          )}

          {hasPremiumAccess && !subscribed && (
            <Card className="mb-8 border-yellow-500/40 bg-yellow-500/5">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Crown className="w-5 h-5 text-yellow-500" />
                      <span className="font-semibold">Acesso Premium ativo</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Você já tem o Cofre liberado. Não precisa assinar de novo.
                    </p>
                  </div>
                  <Button onClick={() => navigate("/premium")}>Abrir Área Premium</Button>
                </div>
              </CardContent>
            </Card>
          )}

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

          {pageLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : plans.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              Nenhum plano disponível no momento.
            </p>
          ) : (
            <div className={`grid gap-6 ${plans.length === 1 ? "max-w-md mx-auto" : "md:grid-cols-2 xl:grid-cols-3"}`}>
              {plans.map((plan) => {
                const isCurrentPlan =
                  hasPremiumAccess ||
                  (subscribed &&
                    (tier === plan.name.toLowerCase() ||
                      (tier === "pro" && plan.name.toLowerCase().includes("pro"))));
                const price =
                  isYearly && plan.price_yearly > 0 ? plan.price_yearly : plan.price_monthly;
                const isSubscribing = subscribingTier === plan.id;

                return (
                  <Card
                    key={plan.id}
                    className={`relative flex flex-col ${
                      plans.length === 1 ? "border-primary shadow-lg" : ""
                    } ${isCurrentPlan ? "ring-2 ring-primary" : ""}`}
                  >
                    {plans.length === 1 && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary">Plano Premium</Badge>
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
                      <div className="w-12 h-12 mx-auto rounded-xl bg-yellow-500/10 flex items-center justify-center mb-3">
                        <Crown className="w-6 h-6 text-yellow-500" />
                      </div>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      {plan.description && <CardDescription>{plan.description}</CardDescription>}
                    </CardHeader>

                    <CardContent className="flex-1">
                      <div className="text-center mb-6">
                        <span className="text-4xl font-bold">
                          {price === 0 ? "Grátis" : `R$ ${price.toFixed(2).replace(".", ",")}`}
                        </span>
                        {price > 0 && (
                          <span className="text-muted-foreground">
                            /{isYearly && plan.price_yearly > 0 ? "ano" : "mês"}
                          </span>
                        )}
                      </div>

                      <ul className="space-y-3">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-5 h-5 flex-shrink-0 mt-0.5 text-yellow-500" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>

                    <CardFooter>
                      {hasPremiumAccess || isCurrentPlan ? (
                        <Button className="w-full" variant="outline" onClick={() => navigate("/premium")}>
                          Acessar Área Premium
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          onClick={() => handleSubscribe(plan)}
                          disabled={isSubscribing || (subscribed && tier !== "free")}
                        >
                          {isSubscribing ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processando...
                            </>
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
          )}

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
