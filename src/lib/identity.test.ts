import { formatIdentityLabel, formatIdentityStatus, formatMaskedCpf } from "./identity";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

assert(formatMaskedCpf("4725") === "••••4725", "mask last4");
assert(formatIdentityStatus("checksum_verified") === "verificado", "checksum is verified");
assert(formatIdentityStatus("bureau_verified") === "verificado", "bureau is verified");
assert(formatIdentityStatus(null) === "pendente", "missing is pending");
assert(
  formatIdentityLabel("4725", "checksum_verified") === "CPF ••••4725 / verificado",
  "admin label never shows full CPF",
);
assert(formatIdentityLabel(null, null) === "CPF pendente", "pending label");
assert(!formatIdentityLabel("4725", "checksum_verified").includes("529"), "no extra digits");

console.log("identity tests passed");
