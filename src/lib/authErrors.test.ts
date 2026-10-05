import assert from "node:assert/strict";
import { authErrorMessage } from "./authErrors";

assert.match(
  authErrorMessage("Email not confirmed"),
  /Reenviar e-mail de confirmação/,
  "maps unconfirmed email",
);
assert.equal(
  authErrorMessage("Invalid login credentials"),
  "E-mail ou senha incorretos.",
  "maps invalid credentials",
);
assert.match(
  authErrorMessage("over_email_send_rate_limit"),
  /Aguarde/,
  "maps rate limit",
);

console.log("authErrors tests passed");
