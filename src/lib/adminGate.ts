export type AdminGateView = "children" | "spinner" | "auth" | "comunidade";

export const ADMIN_GATE_TIMEOUT_MS = 5000;

/**
 * Decide what /admin should render. Confirmed admins always enter.
 * The spinner is only allowed until a one-shot timeout; after that we
 * redirect (auth if logged out, comunidade if logged-in non-admin).
 */
export function resolveAdminGate(input: {
  isAdmin: boolean;
  userPresent: boolean;
  waiting: boolean;
  gateTimedOut: boolean;
}): AdminGateView {
  if (input.isAdmin) return "children";
  if (input.waiting && !input.gateTimedOut) return "spinner";
  if (!input.userPresent) return "auth";
  return "comunidade";
}
