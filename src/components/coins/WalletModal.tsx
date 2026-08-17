import { useState, useEffect } from "react";
import { Coins, Wallet, History, ShoppingBag, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CoinBalance from "./CoinBalance";
import CoinPackageCard from "./CoinPackageCard";
import TransactionHistory from "./TransactionHistory";

interface WalletModalProps {
  trigger?: React.ReactNode;
}

const WalletModal = ({ trigger }: WalletModalProps) => {
  const { wallet, transactions, packages, isLoading, refetch } = useWallet();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  // Check for payment success/cancel in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment");
    
    if (paymentStatus === "success") {
      toast({
        title: "Pagamento realizado! 🎉",
        description: "Seus Nexus Coins foram creditados na sua carteira.",
      });
      refetch();
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === "cancelled") {
      toast({
        title: "Pagamento cancelado",
        description: "O pagamento foi cancelado. Tente novamente quando quiser.",
        variant: "destructive",
      });
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast, refetch]);

  const handlePurchase = async (packageData: {
    id: string;
    coins: number;
    bonusCoins: number;
    name: string;
  }) => {
    setPurchasingId(packageData.id);
    
    try {
      const { data, error } = await supabase.functions.invoke("create-coin-checkout", {
        body: { packageId: packageData.id },
      });

      if (error) throw error;

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: "Erro ao iniciar pagamento",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setPurchasingId(null);
    }
  };

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="gap-2">
      <Coins className="w-4 h-4 text-yellow-500" />
      <span className="font-bold">{wallet?.balance ?? 0}</span>
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Minha Carteira
          </DialogTitle>
          <DialogDescription>
            Gerencie seus Nexus Coins, compre pacotes e veja seu histórico.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Balance Card */}
            <div className="glass-card rounded-xl p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Saldo Atual</p>
              <CoinBalance
                balance={wallet?.balance ?? 0}
                size="lg"
                className="justify-center"
              />
              <div className="flex justify-center gap-6 mt-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total ganho: </span>
                  <span className="text-green-500 font-medium">
                    {(wallet?.total_earned ?? 0).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total gasto: </span>
                  <span className="text-red-500 font-medium">
                    {(wallet?.total_spent ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="buy" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="buy" className="gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Comprar Coins
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-2">
                  <History className="w-4 h-4" />
                  Histórico
                </TabsTrigger>
              </TabsList>

              <TabsContent value="buy" className="mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {packages.map((pkg) => (
                    <CoinPackageCard
                      key={pkg.id}
                      name={pkg.name}
                      description={pkg.description}
                      coins={pkg.coins}
                      bonusCoins={pkg.bonus_coins}
                      price={pkg.price}
                      currency={pkg.currency}
                      isPopular={pkg.is_popular}
                      isLoading={purchasingId === pkg.id}
                      onPurchase={() =>
                        handlePurchase({
                          id: pkg.id,
                          coins: pkg.coins,
                          bonusCoins: pkg.bonus_coins,
                          name: pkg.name,
                        })
                      }
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Pagamento seguro via Stripe. Seus coins são creditados instantaneamente.
                </p>
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                <TransactionHistory transactions={transactions} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WalletModal;