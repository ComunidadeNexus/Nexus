import { useState } from "react";
import { Rocket, Coins, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";

interface BoostPostButtonProps {
  postId: string;
  onBoostSuccess?: () => void;
}

const BOOST_COST = 50;

const BoostPostButton = ({ postId, onBoostSuccess }: BoostPostButtonProps) => {
  const { wallet, spendCoins } = useWallet();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleBoost = async () => {
    if (!wallet || wallet.balance < BOOST_COST) {
      toast({
        title: "Saldo insuficiente",
        description: `Você precisa de ${BOOST_COST} Nexus Coins para impulsionar este post.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await spendCoins(
        BOOST_COST,
        "Impulsionar post",
        postId,
        "post_boost"
      );

      if (result.success) {
        toast({
          title: "Post impulsionado! 🚀",
          description: "Seu post agora terá mais visibilidade.",
        });
        setIsOpen(false);
        onBoostSuccess?.();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível impulsionar o post.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canAfford = wallet && wallet.balance >= BOOST_COST;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
          <Rocket className="w-4 h-4" />
          Impulsionar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary" />
            Impulsionar Post
          </DialogTitle>
          <DialogDescription>
            Destaque seu post no feed e alcance mais pessoas!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="glass-card rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-2xl font-bold">
              <Coins className="w-6 h-6 text-yellow-500" />
              {BOOST_COST}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Custo do impulso
            </p>
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p>✨ Seu post aparecerá em destaque no feed</p>
            <p>📈 Maior alcance e visibilidade</p>
            <p>⏱️ Efeito por 24 horas</p>
          </div>

          {!canAfford && (
            <p className="text-sm text-destructive text-center">
              Você tem {wallet?.balance ?? 0} coins. Precisa de {BOOST_COST}.
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setIsOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={handleBoost}
            disabled={!canAfford || isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Rocket className="w-4 h-4" />
                Impulsionar
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BoostPostButton;