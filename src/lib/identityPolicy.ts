export {
  DIGITS_CHECKED_STATUS,
  IDENTITY_ATTEMPT_DAY_LIMIT,
  IDENTITY_ATTEMPT_HOUR_LIMIT,
  IDENTITY_MESSAGES,
  OWNERSHIP_PROVIDER_TIMEOUT_MS,
  cpfFromRequestBody,
  decideAttemptAllowance,
  hmacSha256Hex,
  identityGateState,
  interpretProviderOutcome,
  isCpfOnFile,
  isIdentityProven,
  ownershipProviderEnabled,
  planCpfBind,
  readIdentityHmacSecrets,
} from "../../supabase/functions/_shared/identityPolicy.ts";
export type { CpfHashRow } from "../../supabase/functions/_shared/identityPolicy.ts";
