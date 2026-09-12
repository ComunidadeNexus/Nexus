const AUTH_COOKIE_EXPIRE = "Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT";

/** sessionStorage: same-tab SPA flag (PR #10). Not enough after a new tab / PWA restart. */
export const SIGNED_OUT_FLAG = "nexus-signed-out";

/**
 * localStorage: survives hard refresh, new tabs, and iOS PWA restarts.
 * Checked in the supabase client module *before* GoTrue initialize() recovers a JWT.
 */
export const FORCE_SIGNED_OUT_FLAG = "nexus-force-signed-out";

/**
 * Live Vercel production (`comunidadenexus.com`) bakes
 * `VITE_SUPABASE_URL=https://ltqxjcanrwvfqziwokvx.supabase.co`.
 * supabase-js 2.90 storageKey is `sb-${hostname.split(".")[0]}-auth-token`.
 */
export const PRODUCTION_SUPABASE_PROJECT_REF = "ltqxjcanrwvfqziwokvx";

export const AUTH_REDIRECT_PATH = "/auth";

function readEnv(name: string): string | undefined {
  try {
    const value = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.[
      name
    ];
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
  } catch {
    return undefined;
  }
}

/** Same hostname rule supabase-js uses: `sb-${url.hostname.split(".")[0]}-auth-token`. */
export function projectRefFromSupabaseUrl(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const host = new URL(url).hostname;
    const ref = host.split(".")[0];
    return ref || null;
  } catch {
    return null;
  }
}

export function collectSupabaseProjectRefs(): string[] {
  const refs = new Set<string>();
  const fromUrl = projectRefFromSupabaseUrl(readEnv("VITE_SUPABASE_URL"));
  if (fromUrl) refs.add(fromUrl);
  const fromId = readEnv("VITE_SUPABASE_PROJECT_ID");
  if (fromId) refs.add(fromId);
  refs.add(PRODUCTION_SUPABASE_PROJECT_REF);
  return [...refs];
}

export function storageKeysForProjectRef(ref: string): string[] {
  const base = `sb-${ref}-auth-token`;
  return [base, `${base}.0`, `${base}.1`, `${base}.2`, `${base}-code-verifier`, `${base}-user`];
}

export function getKnownSupabaseAuthStorageKeys(): string[] {
  return collectSupabaseProjectRefs().flatMap(storageKeysForProjectRef);
}

export function getPrimarySupabaseStorageKey(): string {
  const refs = collectSupabaseProjectRefs();
  return `sb-${refs[0]}-auth-token`;
}

/** Supabase persists the JWT under `sb-<ref>-auth-token` (and chunked / user / pkce keys). */
export function isSupabaseAuthStorageKey(key: string): boolean {
  if (!key) return false;
  if (key.startsWith("sb-") && key.includes("auth-token")) return true;
  if (key.startsWith("supabase.auth.") || key.startsWith("supabase-auth")) return true;
  return false;
}

export function markClientSignedOut() {
  try {
    window.sessionStorage.setItem(SIGNED_OUT_FLAG, "1");
  } catch {
    // private mode / blocked storage
  }
}

export function clearClientSignedOut() {
  try {
    window.sessionStorage.removeItem(SIGNED_OUT_FLAG);
  } catch {
    // private mode / blocked storage
  }
}

export function hasClientSignedOut() {
  try {
    return window.sessionStorage.getItem(SIGNED_OUT_FLAG) === "1";
  } catch {
    return false;
  }
}

export function markForcedSignedOut() {
  try {
    window.localStorage.setItem(FORCE_SIGNED_OUT_FLAG, "1");
  } catch {
    // private mode / blocked storage
  }
  markClientSignedOut();
}

export function clearForcedSignedOut() {
  try {
    window.localStorage.removeItem(FORCE_SIGNED_OUT_FLAG);
  } catch {
    // private mode / blocked storage
  }
  clearClientSignedOut();
}

export function hasForcedSignedOut() {
  try {
    return window.localStorage.getItem(FORCE_SIGNED_OUT_FLAG) === "1";
  } catch {
    return false;
  }
}

function removeKnownKeys(storage: Storage) {
  for (const key of getKnownSupabaseAuthStorageKeys()) {
    storage.removeItem(key);
  }
}

function removeMatchingKeys(storage: Storage) {
  const keys: string[] = [];
  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i);
    if (key) keys.push(key);
  }
  for (const key of keys) {
    if (isSupabaseAuthStorageKey(key)) {
      storage.removeItem(key);
    }
  }
}

function cookieDomains(): Array<string | null> {
  if (typeof window === "undefined") return [null];
  const hostname = window.location.hostname;
  const domains: Array<string | null> = [null, hostname];
  if (hostname.includes(".")) {
    const parts = hostname.split(".");
    if (parts.length >= 2) {
      domains.push(`.${parts.slice(-2).join(".")}`);
    }
    if (hostname.startsWith("www.")) {
      domains.push(hostname.slice(4));
      domains.push(`.${hostname.slice(4)}`);
    }
  }
  return [...new Set(domains)];
}

function expireCookie(name: string) {
  if (typeof document === "undefined") return;
  const paths = ["/", "/auth", "/comunidade", "/admin", "/painel"];
  for (const domain of cookieDomains()) {
    const domainPart = domain ? `; Domain=${domain}` : "";
    for (const path of paths) {
      document.cookie = `${name}=; ${AUTH_COOKIE_EXPIRE}; Path=${path}${domainPart}`;
      document.cookie = `${name}=; ${AUTH_COOKIE_EXPIRE}; Path=${path}${domainPart}; Secure; SameSite=Lax`;
    }
  }
}

function clearMatchingCookies() {
  if (typeof document === "undefined") return;

  const names = new Set(getKnownSupabaseAuthStorageKeys());
  const cookies = document.cookie.split(";");
  for (const part of cookies) {
    const name = part.split("=")[0]?.trim();
    if (name && isSupabaseAuthStorageKey(name)) names.add(name);
  }
  for (const name of names) {
    expireCookie(name);
  }
}

/**
 * Drop every persisted Supabase session key. Used after signOut so a failed
 * global revoke (network / lock / non-401 API error) cannot leave the user
 * logged in on this device.
 */
export function clearPersistedSupabaseAuth() {
  if (typeof window === "undefined") return;

  try {
    removeKnownKeys(window.localStorage);
    removeMatchingKeys(window.localStorage);
  } catch {
    // private mode / blocked storage
  }

  try {
    removeKnownKeys(window.sessionStorage);
    removeMatchingKeys(window.sessionStorage);
  } catch {
    // private mode / blocked storage
  }

  try {
    clearMatchingCookies();
  } catch {
    // ignore cookie failures
  }
}

/**
 * Must run before `createClient()` so GoTrue initialize() cannot recover a JWT
 * we already decided to kill.
 */
export function applyForcedSignOutOnBoot() {
  if (typeof window === "undefined") return;
  if (!hasForcedSignedOut() && !hasClientSignedOut()) return;
  markForcedSignedOut();
  clearPersistedSupabaseAuth();
}

export function performHardSignOut(redirectTo = AUTH_REDIRECT_PATH) {
  markForcedSignedOut();
  clearPersistedSupabaseAuth();

  const wipeAgain = () => {
    try {
      clearPersistedSupabaseAuth();
    } catch {
      // ignore
    }
  };
  try {
    window.addEventListener("pagehide", wipeAgain, { once: true });
    window.addEventListener("beforeunload", wipeAgain, { once: true });
  } catch {
    // ignore
  }

  wipeAgain();
  window.location.replace(redirectTo);
}
