import { isIdentityProven } from "./identityPolicy";

export function formatMaskedCpf(last4: string | null | undefined): string {
  if (!last4) return "Pendente";
  return `••••${last4}`;
}

export function formatIdentityStatus(status: string | null | undefined): string {
  if (isIdentityProven(status)) return "identidade verificada";
  if (status === "digits_checked" || status === "checksum_verified") return "dígitos conferidos";
  if (status === "bureau_verified") return "sem prova de titularidade";
  return "pendente";
}

export function formatIdentityLabel(
  last4: string | null | undefined,
  status: string | null | undefined,
): string {
  if (!last4 || !status) return "CPF pendente";
  return `CPF ${formatMaskedCpf(last4)} / ${formatIdentityStatus(status)}`;
}
