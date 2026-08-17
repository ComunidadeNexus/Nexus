import { Coins, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CoinPackageCardProps {
  name: string;
  description: string | null;
  coins: number;
  bonusCoins: number;
  price: number;
  currency: string;
  isPopular: boolean;
  onPurchase: () => void;
  isLoading?: boolean;
}

const CoinPackageCard = ({
  name,
  description,
  coins,
  bonusCoins,
  price,
  currency,
  isPopular,
  onPurchase,
  isLoading,
}: CoinPackageCardProps) => {
  const totalCoins = coins + bonusCoins;
  const pricePerCoin = (price / totalCoins).toFixed(2);

  return (
    <div
      className={cn(
        "relative glass-card rounded-xl p-5 border transition-all duration-200 hover:scale-[1.02]",
        isPopular
          ? "border-primary/50 bg-primary/5 ring-2 ring-primary/20"
          : "border-white/10 hover:border-white/20"
      )}
    >
      {isPopular && (
        <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
          <Sparkles className="w-3 h-3 mr-1" />
          Mais Popular
        </Badge>
      )}

      <div className="text-center space-y-4">
        {/* Package Name */}
        <h3 className="text-lg font-bold">{name}</h3>

        {/* Coins Display */}
        <div className="flex items-center justify-center gap-2">
          <Coins className="w-8 h-8 text-yellow-500" />
          <span className="text-3xl font-bold">{coins.toLocaleString()}</span>
        </div>

        {/* Bonus */}
        {bonusCoins > 0 && (
          <div className="flex items-center justify-center gap-1 text-green-500">
            <Check className="w-4 h-4" />
            <span className="font-medium">+{bonusCoins} bônus</span>
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}

        {/* Price per coin */}
        <p className="text-xs text-muted-foreground">
          R$ {pricePerCoin} por coin
        </p>

        {/* Price & Purchase Button */}
        <div className="pt-2">
          <Button
            onClick={onPurchase}
            disabled={isLoading}
            className={cn(
              "w-full",
              isPopular ? "bg-primary hover:bg-primary/90" : ""
            )}
            variant={isPopular ? "default" : "outline"}
          >
            {currency === "BRL" ? "R$" : "$"} {price.toFixed(2)}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CoinPackageCard;