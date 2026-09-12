import { resolveAdminGate } from "./adminGate";
import { getCachedAdminRole, setCachedAdminRole, clearAdminRoleCache } from "./adminRole";
import { readStoredAuthSession } from "./authStorage";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

clearAdminRoleCache();

assert(
  resolveAdminGate({ isAdmin: true, userPresent: true, waiting: true, gateTimedOut: false }) ===
    "children",
  "confirmed admin must enter even while a re-check is loading",
);

assert(
  resolveAdminGate({ isAdmin: false, userPresent: true, waiting: true, gateTimedOut: false }) ===
    "spinner",
  "unknown role still waiting shows the spinner",
);

assert(
  resolveAdminGate({ isAdmin: false, userPresent: true, waiting: true, gateTimedOut: true }) ===
    "comunidade",
  "timeout with a logged-in non-admin redirects to comunidade",
);

assert(
  resolveAdminGate({ isAdmin: false, userPresent: false, waiting: true, gateTimedOut: true }) ===
    "auth",
  "timeout without a user redirects to auth",
);

assert(
  resolveAdminGate({ isAdmin: false, userPresent: false, waiting: false, gateTimedOut: false }) ===
    "auth",
  "settled logged-out visitor is sent to auth",
);

assert(
  resolveAdminGate({ isAdmin: true, userPresent: true, waiting: false, gateTimedOut: false }) ===
    "children",
  "admin navigating to /admin with a live session must enter — not bounce to /auth",
);

assert(
  resolveAdminGate({ isAdmin: false, userPresent: true, waiting: false, gateTimedOut: false }) ===
    "comunidade",
  "settled logged-in non-admin is blocked",
);

assert(
  resolveAdminGate({ isAdmin: true, userPresent: true, waiting: false, gateTimedOut: true }) ===
    "children",
  "admin still enters after the gate timeout",
);

setCachedAdminRole("user-a", true);
assert(getCachedAdminRole("user-a") === true, "memory cache stores admin=true");
setCachedAdminRole("user-a", false);
assert(getCachedAdminRole("user-a") === false, "memory cache can update to false");
clearAdminRoleCache("user-a");
assert(getCachedAdminRole("user-a") === null, "clearing a user drops the cache");

const store = new Map<string, string>();
const localStorageMock = {
  get length() {
    return store.size;
  },
  key(index: number) {
    return [...store.keys()][index] ?? null;
  },
  getItem(key: string) {
    return store.get(key) ?? null;
  },
  setItem(key: string, value: string) {
    store.set(key, value);
  },
  removeItem(key: string) {
    store.delete(key);
  },
};
Object.defineProperty(globalThis, "localStorage", { configurable: true, value: localStorageMock });

store.set(
  "sb-ltqxjcanrwvfqziwokvx-auth-token",
  JSON.stringify({
    access_token: "token-1",
    refresh_token: "refresh-1",
    expires_at: 1_800_000_000,
    user: { id: "dadb693d-425d-42a6-ae50-4fb1eeb58c8b", email: "admin@example.com" },
  }),
);

const stored = readStoredAuthSession();
assert(
  stored?.user.id === "dadb693d-425d-42a6-ae50-4fb1eeb58c8b",
  "reads sb-*-auth-token from localStorage",
);
assert(stored?.access_token === "token-1", "returns the access token without supabase-js");

console.log("admin gate tests passed");
