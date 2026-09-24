export const LISTING_CATEGORY_LABELS: Record<string, string> = {
  produto: "Produto físico",
  servico: "Serviço",
  digital: "Produto digital",
};

export const LISTING_CONDITION_LABELS: Record<string, string> = {
  novo: "Novo",
  usado: "Usado",
  recondicionado: "Recondicionado",
};

export function formatListingPrice(price: number) {
  if (price <= 0) return "Grátis";
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
