export function formatMaskedCpf(last4: string | null | undefined): string {
  if (!last4) return "Pendente";
  return `••••${last4}`;
}

export function formatIdentityStatus(status: string | null | undefined): string {
  if (status === "bureau_verified" || status === "checksum_verified") return "verificado";
  return "pendente";
}

export function formatIdentityLabel(
  last4: string | null | undefined,
  status: string | null | undefined,
): string {
  if (!last4 || !status) return "CPF pendente";
  return `CPF ${formatMaskedCpf(last4)} / ${formatIdentityStatus(status)}`;
}
