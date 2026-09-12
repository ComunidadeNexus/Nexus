const AUTH_COOKIE_EXPIRE = "Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT";

/** Supabase persists the JWT under `sb-<ref>-auth-token` (and chunked `.0` / `.1` keys). */
export function isSupabaseAuthStorageKey(key: string): boolean {
  return key.startsWith("sb-") && key.includes("auth-token");
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

function clearMatchingCookies() {
  if (typeof document === "undefined") return;

  const cookies = document.cookie.split(";");
  for (const part of cookies) {
    const name = part.split("=")[0]?.trim();
    if (!name || !isSupabaseAuthStorageKey(name)) continue;

    document.cookie = `${name}=; ${AUTH_COOKIE_EXPIRE}; path=/`;
    document.cookie = `${name}=; ${AUTH_COOKIE_EXPIRE}; path=/; domain=${window.location.hostname}`;
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
    removeMatchingKeys(window.localStorage);
  } catch {
    // private mode / blocked storage
  }

  try {
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
