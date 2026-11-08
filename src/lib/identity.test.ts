import { formatIdentityLabel, formatIdentityStatus, formatMaskedCpf } from "./identity";
import { isIdentityProven } from "./identityPolicy";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

assert(formatMaskedCpf("9012") === "••••9012", "mask last4");
assert(
  formatIdentityStatus("checksum_verified") === "dígitos conferidos",
  "checksum is not identity",
);
assert(formatIdentityStatus("digits_checked") === "dígitos conferidos", "digits stay digits");
assert(
  formatIdentityStatus("bureau_verified") === "sem prova de titularidade",
  "registry hit is not ownership",
);
assert(formatIdentityStatus(null) === "pendente", "missing is pending");
assert(
  formatIdentityStatus("ownership_verified") === "pendente",
  "unapproved status stays pending",
);
assert(isIdentityProven("checksum_verified") === false, "checksum is not proved");
assert(isIdentityProven("bureau_verified") === false, "bureau is not proved");
assert(isIdentityProven("digits_checked") === false, "digits are not proved");
assert(
  formatIdentityLabel("9012", "checksum_verified") === "CPF ••••9012 / dígitos conferidos",
  "admin label shows digits, not verification",
);
assert(
  formatIdentityLabel("9012", "bureau_verified") === "CPF ••••9012 / sem prova de titularidade",
  "admin label does not call a lookup verified",
);
assert(formatIdentityLabel(null, null) === "CPF pendente", "pending label");
assert(
  !formatIdentityLabel("9012", "checksum_verified").includes("verificado"),
  "no verified word",
);
assert(!formatIdentityLabel("9012", "checksum_verified").includes("1234"), "no extra digits");

console.log("identity tests passed");
