import { cpfDigits, isValidCpf } from "./cpf.ts";

/**
 * Identity proof is intentionally unavailable.
 *
 * Check digits only show that a number could be a CPF. A registry lookup that
 * says the number exists does not prove the signed-in person is the holder.
 * Do not call IDENTITY_API_URL and do not invent a response schema.
 *
 * The missing integration is a provider contract that explicitly matches the
 * holder (for example name and birth date supplied by that person), with this
 * timeout, a documented success field, and a safe failure. Until that contract
 * is reviewed, every provider payload is refused and no row is marked proved.
 */
export const OWNERSHIP_PROVIDER_TIMEOUT_MS = 8_000;

export const IDENTITY_ATTEMPT_HOUR_LIMIT = 5;
export const IDENTITY_ATTEMPT_DAY_LIMIT = 20;

export const DIGITS_CHECKED_STATUS = "digits_checked" as const;

export const IDENTITY_MESSAGES = {
  invalid: "CPF inválido.",
  unavailable: "Registro de CPF indisponível no momento.",
  limited: "Muitas tentativas. Tente novamente mais tarde.",
  opaque: "Não foi possível confirmar este CPF agora.",
  recorded: "CPF registrado. A comprovação de identidade ainda não está disponível.",
  digitsHint: "Conferimos os dígitos. Isso não comprova titularidade.",
  explanation:
    "Conferimos apenas os dígitos e guardamos um código com os 4 últimos números, nunca o CPF completo. Isso não comprova titularidade. Consultar se o CPF existe também não comprova. A prova de identidade fica indisponível até existir um provedor com esse contrato.",
  proofUnavailable:
    "A comprovação de identidade ainda não está disponível. Conferir os dígitos do CPF não autoriza esta ação.",
} as const;

const CPF_ON_FILE = new Set(["checksum_verified", "bureau_verified", "digits_checked"]);

export function ownershipProviderEnabled(): boolean {
  return false;
}

export function interpretProviderOutcome(_outcome: {
  httpOk?: boolean;
  timedOut?: boolean;
  body?: unknown;
}): { proven: false; reason: "ownership_contract_not_approved" } {
  return { proven: false, reason: "ownership_contract_not_approved" };
}

export function isIdentityProven(_status: string | null | undefined): boolean {
  return false;
}

/** Legacy and new rows that recorded a CPF without proving ownership. */
export function isCpfOnFile(status: string | null | undefined): boolean {
  return typeof status === "string" && CPF_ON_FILE.has(status);
}

export function identityGateState(input: {
  status: string | null | undefined;
  loadError: boolean;
}): { cpfOnFile: boolean; identityVerified: boolean; blockForReadError: boolean } {
  const cpfOnFile = isCpfOnFile(input.status);
  return {
    cpfOnFile,
    identityVerified: isIdentityProven(input.status),
    blockForReadError: input.loadError && !cpfOnFile,
  };
}

export function decideAttemptAllowance(hourCount: number, dayCount: number): "allow" | "limit" {
  if (!Number.isFinite(hourCount) || !Number.isFinite(dayCount)) return "limit";
  if (hourCount >= IDENTITY_ATTEMPT_HOUR_LIMIT || dayCount >= IDENTITY_ATTEMPT_DAY_LIMIT) {
    return "limit";
  }
  return "allow";
}

export function readIdentityHmacSecrets(env: {
  IDENTITY_HMAC_SECRET?: string | null;
  IDENTITY_HMAC_SECRET_PREVIOUS?: string | null;
  SUPABASE_SERVICE_ROLE_KEY?: string | null;
}): { primary: string | null; previous: string | null } {
  // The service-role key is a database credential. It is never an HMAC key.
  void env.SUPABASE_SERVICE_ROLE_KEY;
  const primary = env.IDENTITY_HMAC_SECRET?.trim() ?? "";
  const previous = env.IDENTITY_HMAC_SECRET_PREVIOUS?.trim() ?? "";
  return {
    primary: primary.length > 0 ? primary : null,
    previous: previous.length > 0 && previous !== primary ? previous : null,
  };
}

export async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function cpfFromRequestBody(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const value = (body as { cpf?: unknown }).cpf;
  if (typeof value !== "string") return null;
  const digits = cpfDigits(value);
  if (!isValidCpf(digits)) return null;
  return digits;
}

export type CpfHashRow = { userId: string; cpfHash: string };

/**
 * Same-user replay is idempotent. Another account, or a second CPF on this
 * account, is an opaque conflict: the caller must not learn which one it was.
 */
export function planCpfBind(input: {
  userId: string;
  candidateHashes: string[];
  existingForUser: CpfHashRow | null;
  hashOwners: CpfHashRow[];
}): "insert" | "idempotent" | "opaque_conflict" {
  const hashes = new Set(input.candidateHashes.filter((hash) => hash.length > 0));
  if (input.hashOwners.some((owner) => owner.userId !== input.userId)) return "opaque_conflict";
  if (input.existingForUser && !hashes.has(input.existingForUser.cpfHash)) return "opaque_conflict";
  if (input.existingForUser || input.hashOwners.some((owner) => owner.userId === input.userId)) {
    return "idempotent";
  }
  return "insert";
}
