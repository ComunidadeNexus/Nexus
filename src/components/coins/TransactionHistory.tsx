import { Coins, ArrowUp, ArrowDown, Gift, ShoppingCart, RefreshCw, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  created_at: string;
}

type TransactionType = "purchase" | "reward" | "spend" | "transfer_in" | "transfer_out" | "refund";

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const getTransactionIcon = (type: Transaction["type"]) => {
  switch (type) {
    case "purchase":
      return ShoppingCart;
    case "reward":
      return Gift;
    case "spend":
      return ArrowUp;
    case "transfer_in":
      return ArrowDown;
    case "transfer_out":
      return Send;
    case "refund":
      return RefreshCw;
    default:
      return Coins;
  }
};

const getTransactionColor = (type: Transaction["type"]) => {
  switch (type) {
    case "purchase":
    case "reward":
    case "transfer_in":
    case "refund":
      return "text-green-500";
    case "spend":
    case "transfer_out":
      return "text-red-500";
    default:
      return "text-muted-foreground";
  }
};

const getTransactionLabel = (type: Transaction["type"]) => {
  switch (type) {
    case "purchase":
      return "Compra";
    case "reward":
      return "Recompensa";
    case "spend":
      return "Gasto";
    case "transfer_in":
      return "Recebido";
    case "transfer_out":
      return "Enviado";
    case "refund":
      return "Reembolso";
    default:
      return type;
  }
};

const TransactionHistory = ({ transactions }: TransactionHistoryProps) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Coins className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Nenhuma transação ainda</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx) => {
        const Icon = getTransactionIcon(tx.type);
        const color = getTransactionColor(tx.type);
        const isPositive = ["purchase", "reward", "transfer_in", "refund"].includes(tx.type);

        return (
          <div
            key={tx.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className={cn("p-2 rounded-full bg-muted", color)}>
              <Icon className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">
                  {getTransactionLabel(tx.type)}
                </span>
              </div>
              {tx.description && (
                <p className="text-xs text-muted-foreground truncate">
                  {tx.description}
                </p>
              )}
            </div>

            <div className="text-right">
              <div className={cn("font-bold", color)}>
                {isPositive ? "+" : "-"}{tx.amount.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(tx.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TransactionHistory;