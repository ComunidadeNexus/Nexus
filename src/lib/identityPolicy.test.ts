import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { formatCpf } from "./cpf";
import {
  IDENTITY_ATTEMPT_DAY_LIMIT,
  IDENTITY_ATTEMPT_HOUR_LIMIT,
  IDENTITY_MESSAGES,
  OWNERSHIP_PROVIDER_TIMEOUT_MS,
  cpfFromRequestBody,
  decideAttemptAllowance,
  IDENTITY_HMAC_WRITE_CONFIRMATION,
  hmacSha256Hex,
  identityGateState,
  identityHashWritesEnabled,
  interpretProviderOutcome,
  ownershipProviderEnabled,
  planCpfBind,
  readIdentityHmacSecrets,
} from "./identityPolicy";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

function officialDigit(digits: string): number {
  let weight = digits.length + 1;
  let sum = 0;
  for (const char of digits) {
    sum += Number(char) * weight;
    weight -= 1;
  }
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

function officialCpf(base9: string): string {
  const first = officialDigit(base9);
  const second = officialDigit(base9 + String(first));
  return base9 + String(first) + String(second);
}

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (path: string) => readFileSync(join(root, path), "utf8");

const userA = "user-a";
const userB = "user-b";
const hashA = "a".repeat(64);
const hashB = "b".repeat(64);
const hashPrevious = "c".repeat(64);

assert(
  planCpfBind({
    userId: userA,
    candidateHashes: [hashA],
    existingForUser: null,
    hashOwners: [],
  }) === "insert",
  "free number is recorded",
);

assert(
  planCpfBind({
    userId: userA,
    candidateHashes: [hashA, hashPrevious],
    existingForUser: { userId: userA, cpfHash: hashPrevious },
    hashOwners: [{ userId: userA, cpfHash: hashPrevious }],
  }) === "idempotent",
  "same account and previous key replays",
);

assert(
  planCpfBind({
    userId: userB,
    candidateHashes: [hashA],
    existingForUser: null,
    hashOwners: [{ userId: userA, cpfHash: hashA }],
  }) === "opaque_conflict",
  "other account is an opaque conflict",
);

assert(
  planCpfBind({
    userId: userA,
    candidateHashes: [hashB],
    existingForUser: { userId: userA, cpfHash: hashA },
    hashOwners: [],
  }) === "opaque_conflict",
  "second number on the same account conflicts",
);

assert(
  planCpfBind({
    userId: userA,
    candidateHashes: [hashA],
    existingForUser: { userId: userA, cpfHash: hashA },
    hashOwners: [{ userId: userA, cpfHash: hashA }],
  }) === "idempotent",
  "unique violation replay for the same hash succeeds",
);

assert(decideAttemptAllowance(4, 19) === "allow", "under both limits");
assert(decideAttemptAllowance(IDENTITY_ATTEMPT_HOUR_LIMIT, 0) === "limit", "hour limit");
assert(decideAttemptAllowance(0, IDENTITY_ATTEMPT_DAY_LIMIT) === "limit", "day limit");
assert(decideAttemptAllowance(Number.NaN, 0) === "limit", "bad count fails closed");

const ignoredKey = readIdentityHmacSecrets({
  IDENTITY_HMAC_SECRET: "  ",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-must-not-be-hmac",
});
assert(
  ignoredKey.primary === null && ignoredKey.previous === null,
  "service role is not an HMAC key",
);

const keys = readIdentityHmacSecrets({
  IDENTITY_HMAC_SECRET: " dedicated-secret ",
  IDENTITY_HMAC_SECRET_PREVIOUS: "old-dedicated-secret",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-must-not-be-hmac",
});
assert(
  identityHashWritesEnabled({
    IDENTITY_HMAC_SECRET: "dedicated-secret",
    SUPABASE_SERVICE_ROLE_KEY: "service-role-must-not-be-hmac",
  }) === false,
  "a dedicated secret alone does not enable hash writes",
);
assert(
  identityHashWritesEnabled({
    IDENTITY_HMAC_WRITE_MODE: IDENTITY_HMAC_WRITE_CONFIRMATION,
    SUPABASE_SERVICE_ROLE_KEY: "service-role-must-not-be-hmac",
  }) === false,
  "the service role does not confirm historical hashes",
);
assert(
  identityHashWritesEnabled({
    IDENTITY_HMAC_WRITE_MODE: ` ${IDENTITY_HMAC_WRITE_CONFIRMATION} `,
    IDENTITY_HMAC_SECRET: " dedicated-secret ",
  }) === true,
  "writes require the exact confirmation and a dedicated secret",
);
assert(
  identityHashWritesEnabled({
    IDENTITY_HMAC_WRITE_MODE: `${IDENTITY_HMAC_WRITE_CONFIRMATION}-later`,
    IDENTITY_HMAC_SECRET: "dedicated-secret",
  }) === false,
  "confirmation must match exactly",
);
assert(keys.primary === "dedicated-secret", "primary secret is trimmed");
assert(keys.previous === "old-dedicated-secret", "previous dedicated secret is kept");
assert(
  readIdentityHmacSecrets({
    IDENTITY_HMAC_SECRET: "dedicated-secret",
    IDENTITY_HMAC_SECRET_PREVIOUS: "dedicated-secret",
  }).previous === null,
  "duplicate previous secret is ignored",
);

assert(ownershipProviderEnabled() === false, "provider stays off");
assert(
  OWNERSHIP_PROVIDER_TIMEOUT_MS >= 1000 && OWNERSHIP_PROVIDER_TIMEOUT_MS <= 15000,
  "timeout bounded",
);
for (const outcome of [
  { httpOk: true, body: { valid: true, match: true, owner: true } },
  { httpOk: true, body: { status: "approved" } },
  { timedOut: true },
  {},
]) {
  const result = interpretProviderOutcome(outcome);
  assert(result.proven === false, "provider payload is not proof");
  assert(result.reason === "ownership_contract_not_approved", "reason stays explicit");
}

const onFile = identityGateState({ status: "checksum_verified", loadError: true });
assert(
  onFile.cpfOnFile && !onFile.identityVerified && !onFile.blockForReadError,
  "legacy row stays in",
);
assert(
  identityGateState({ status: "bureau_verified", loadError: false }).identityVerified === false,
  "bureau row is not proved",
);
assert(
  identityGateState({ status: "digits_checked", loadError: false }).cpfOnFile === true,
  "new row is on file",
);
const missing = identityGateState({ status: null, loadError: true });
assert(
  !missing.cpfOnFile && missing.blockForReadError && !missing.identityVerified,
  "read error is not an empty CPF",
);
assert(
  identityGateState({ status: "ownership_verified", loadError: false }).identityVerified === false,
  "invented proof status is refused",
);

const messages = Object.values(IDENTITY_MESSAGES).join("\n");
assert(!/j[aá] est[aá] vinculad/i.test(messages), "messages do not enumerate a link");
assert(!/outra conta/i.test(messages), "messages do not reveal another account");
assert(!messages.includes("Identidade verificada"), "messages do not claim verification");
assert(IDENTITY_MESSAGES.explanation.includes("não comprova"), "explanation is honest");
assert(
  IDENTITY_MESSAGES.explanation.includes("provedor"),
  "explanation names the missing contract",
);

assert(cpfFromRequestBody(null) === null, "empty body");
assert(cpfFromRequestBody({ cpf: 123 }) === null, "non-string is rejected");
assert(cpfFromRequestBody({ cpf: "111.111.111-11" }) === null, "repeated digits rejected");
const synthetic = officialCpf("123456789");
assert(
  cpfFromRequestBody({ cpf: formatCpf(synthetic) }) === synthetic,
  "formatted synthetic CPF accepted",
);

const migration = read("supabase/migrations/20261108120000_identity_digits_and_attempt_limits.sql");
assert(migration.includes("digits_checked"), "new status added");
assert(migration.includes("checksum_verified"), "legacy status kept");
assert(!/UPDATE\s+public\.identity_verifications\b/i.test(migration), "rows are not rewritten");
assert(
  !/DELETE\s+FROM\s+public\.identity_verifications\b/i.test(migration),
  "rows are not deleted",
);
assert(!migration.includes("CREATE POLICY"), "community policies stay untouched");
assert(!migration.includes("public.posts"), "posts RLS stays untouched");
assert(migration.includes(`hour_count >= ${IDENTITY_ATTEMPT_HOUR_LIMIT}`), "hour limit matches");
assert(migration.includes(`day_count >= ${IDENTITY_ATTEMPT_DAY_LIMIT}`), "day limit matches");
assert(/rollback/i.test(migration), "rollback is documented");
assert(migration.includes("pg_advisory_xact_lock"), "attempts serialize per user");
assert(
  migration.includes("REVOKE ALL ON FUNCTION public.begin_identity_attempt(uuid) FROM PUBLIC"),
  "attempt RPC is not public",
);
assert(
  migration.includes(
    "GRANT EXECUTE ON FUNCTION public.begin_identity_attempt(uuid) TO service_role",
  ),
  "service role runs the limiter",
);
assert(
  !migration.includes("SUPABASE_SERVICE_ROLE"),
  "migration does not use the service role as a secret",
);
assert(migration.includes("Do not update, delete, reassign, or rehash"), "legacy rows are frozen");
assert(migration.includes("Do not set IDENTITY_HMAC_WRITE_MODE"), "hash writes stay off");
assert(migration.includes(IDENTITY_HMAC_WRITE_CONFIRMATION), "confirmation token is documented");

const verifyFn = read("supabase/functions/verify-identity/index.ts");
assert(!verifyFn.includes("fetch("), "function does not call a provider");
assert(!verifyFn.includes("IDENTITY_API_URL"), "registry URL is ignored");
assert(!verifyFn.includes("bureau_verified"), "function does not write a bureau status");
assert(!verifyFn.includes("checksum_verified"), "function does not write checksum as proof");
assert(verifyFn.includes("DIGITS_CHECKED_STATUS"), "new rows are digits only");
assert(verifyFn.includes('identity: "pending"'), "success stays pending");
assert(verifyFn.includes("planCpfBind"), "conflict plan is shared");
assert(verifyFn.includes("23505"), "unique races are replanned");
assert(
  verifyFn.indexOf("IDENTITY_MESSAGES.unavailable") < verifyFn.indexOf("begin_identity_attempt"),
  "missing key fails before the limiter",
);
assert(
  verifyFn.indexOf("begin_identity_attempt") < verifyFn.indexOf("req.json"),
  "limiter runs before the CPF is read",
);
assert(
  verifyFn.indexOf("identityHashWritesEnabled") < verifyFn.indexOf("req.json"),
  "hash writes are refused before the CPF is read",
);
assert(
  verifyFn.indexOf("identityHashWritesEnabled") < verifyFn.indexOf("await hmacSha256Hex"),
  "hash writes are refused before an HMAC is computed",
);
assert(!verifyFn.includes("já está vinculado"), "old enumeration copy is gone");
assert(!verifyFn.includes("outra conta"), "old enumeration copy is gone");
assert(
  !/IDENTITY_HMAC_SECRET[\s\S]{0,180}SERVICE_ROLE/.test(verifyFn),
  "HMAC does not fall back to service role",
);

const producerFn = read("supabase/functions/cakto-producer-apply/index.ts");
assert(producerFn.includes("isIdentityProven"), "seller gate uses proof");
assert(producerFn.includes("IDENTITY_MESSAGES.proofUnavailable"), "seller gate fails closed");
assert(producerFn.includes("readIdentityHmacSecrets"), "seller hash uses the dedicated key");
assert(
  !producerFn.includes('["checksum_verified", "bureau_verified"]'),
  "checksum no longer authorizes selling",
);
assert(
  producerFn.indexOf("isIdentityProven") < producerFn.indexOf("req.json"),
  "seller gate runs before the document is read",
);
assert(
  !/IDENTITY_HMAC_SECRET[\s\S]{0,180}SERVICE_ROLE/.test(producerFn),
  "seller HMAC does not use the service role",
);

const page = read("src/pages/VerificarIdentidade.tsx");
const auth = read("src/pages/Auth.tsx");
const route = read("src/components/ProtectedRoute.tsx");
const membros = read("src/components/admin/AdminMembros.tsx");
const adminData = read("src/hooks/useAdminData.tsx");
assert(page.includes("IDENTITY_MESSAGES.explanation"), "page explains the gap");
assert(page.includes("IDENTITY_MESSAGES.recorded"), "page uses the pending confirmation");
assert(!page.includes("Identidade verificada"), "page does not claim verification");
assert(page.includes("cpfOnFile"), "page follows the CPF-on-file gate");
assert(auth.includes("IDENTITY_MESSAGES.digitsHint"), "signup states the limit");
assert(auth.includes("IDENTITY_MESSAGES.recorded"), "signup confirmation is pending");
assert(!auth.includes("Identidade verificada"), "signup does not claim verification");
assert(route.includes("blockForReadError"), "read errors stay on the retry screen");
assert(route.includes("cpfOnFile"), "route no longer treats any status as verified");
assert(!route.includes("if (!verified)"), "old verified gate is gone");
assert(membros.includes("toggleVerifyUser"), "social badge action remains");
assert(membros.includes("Selo verificado"), "social badge copy remains");
assert(membros.includes("Identidade CPF"), "admin identity column is separate");
assert(membros.includes("Não altera o selo verificado do perfil."), "admin explains the split");
assert(adminData.includes('.eq("is_verified", true)'), "dashboard count remains the social badge");

const one = await hmacSha256Hex("dedicated-test-secret", "synthetic-payload");
const two = await hmacSha256Hex("dedicated-test-secret", "synthetic-payload");
const other = await hmacSha256Hex("other-dedicated-secret", "synthetic-payload");
assert(one === two, "hmac is stable");
assert(one !== other, "hmac changes with the dedicated secret");
assert(/^[0-9a-f]{64}$/.test(one), "hmac is hex");

console.log("identity policy tests passed");
