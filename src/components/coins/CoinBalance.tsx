import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";

interface CoinBalanceProps {
  balance: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const CoinBalance = ({ balance, size = "md", showLabel = false, className }: CoinBalanceProps) => {
  const sizeClasses = {
    sm: "text-sm gap-1",
    md: "text-base gap-1.5",
    lg: "text-xl gap-2",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div className={cn("flex items-center", sizeClasses[size], className)}>
      <Coins className={cn("text-yellow-500", iconSizes[size])} />
      <span className="font-bold tabular-nums">{balance.toLocaleString()}</span>
      {showLabel && <span className="text-muted-foreground">coins</span>}
    </div>
  );
};

export default CoinBalance;