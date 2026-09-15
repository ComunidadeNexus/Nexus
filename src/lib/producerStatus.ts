export type ProducerStatus = "none" | "pending" | "under_review" | "approved" | "rejected" | "suspended";

export function producerStatusLabel(status: ProducerStatus | string | null | undefined): string {
  switch (status) {
    case "pending":
    case "under_review":
      return "Cadastro em análise";
    case "approved":
      return "Conta aprovada";
    case "rejected":
      return "Conta recusada";
    case "suspended":
      return "Conta suspensa";
    default:
      return "Conta financeira não configurada";
  }
}
