import {
  AUTH_REDIRECT_PATH,
  FORCE_SIGNED_OUT_FLAG,
  PRODUCTION_SUPABASE_PROJECT_REF,
  SIGNED_OUT_FLAG,
  applyForcedSignOutOnBoot,
  clearClientSignedOut,
  clearForcedSignedOut,
  clearPersistedSupabaseAuth,
  collectSupabaseProjectRefs,
  getKnownSupabaseAuthStorageKeys,
  getPrimarySupabaseStorageKey,
  hasClientSignedOut,
  hasForcedSignedOut,
  isExplicitSignInEvent,
  isSupabaseAuthStorageKey,
  markClientSignedOut,
  markForcedSignedOut,
  noteSuccessfulSignIn,
  performHardSignOut,
  projectRefFromSupabaseUrl,
  readStoredAuthSession,
  resolveForcedSignOutSession,
  storageKeysForProjectRef,
} from "./authStorage";

const KEY_CASES: Array<[string, boolean]> = [
  ["sb-abcdef-auth-token", true],
  ["sb-abcdef-auth-token.0", true],
  ["sb-abcdef-auth-token.1", true],
  ["sb-abcdef-auth-token-code-verifier", true],
  ["sb-abcdef-auth-token-user", true],
  [`sb-${PRODUCTION_SUPABASE_PROJECT_REF}-auth-token`, true],
  [`sb-${PRODUCTION_SUPABASE_PROJECT_REF}-auth-token.0`, true],
  ["supabase.auth.token", true],
  ["theme", false],
  ["saved_posts", false],
  ["nexus-theme", false],
  [FORCE_SIGNED_OUT_FLAG, false],
];

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

function createMemoryStorage(initial: Record<string, string> = {}): Storage {
  const store = { ...initial };
  return {
    get length() {
      return Object.keys(store).length;
    },
    key(index: number) {
      return Object.keys(store)[index] ?? null;
    },
    getItem(key: string) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    },
    setItem(key: string, value: string) {
      store[key] = value;
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      for (const key of Object.keys(store)) delete store[key];
    },
  };
}

function runKeyMatcherTests() {
  for (const [key, expected] of KEY_CASES) {
    assert(
      isSupabaseAuthStorageKey(key) === expected,
      `isSupabaseAuthStorageKey(${key}) should be ${expected}`,
    );
  }
}

function runProjectRefTests() {
  assert(
    projectRefFromSupabaseUrl("https://ltqxjcanrwvfqziwokvx.supabase.co") ===
      PRODUCTION_SUPABASE_PROJECT_REF,
    "live VITE_SUPABASE_URL hostname must yield the production project ref",
  );
  assert(
    projectRefFromSupabaseUrl("https://ltqxjcanrwvfqziwokvx.supabase.co/") ===
      PRODUCTION_SUPABASE_PROJECT_REF,
    "trailing slash on the supabase URL must not change the ref",
  );
  assert(projectRefFromSupabaseUrl("not-a-url") === null, "invalid URL should return null");

  const refs = collectSupabaseProjectRefs();
  assert(
    refs.includes(PRODUCTION_SUPABASE_PROJECT_REF),
    "collectSupabaseProjectRefs must always include the live production ref",
  );
  assert(
    getPrimarySupabaseStorageKey().includes("auth-token"),
    "primary storage key must be an auth-token key",
  );

  const prodKeys = storageKeysForProjectRef(PRODUCTION_SUPABASE_PROJECT_REF);
  assert(
    prodKeys.includes(`sb-${PRODUCTION_SUPABASE_PROJECT_REF}-auth-token`),
    "known keys must include the exact supabase-js 2.90 key",
  );
  assert(
    prodKeys.includes(`sb-${PRODUCTION_SUPABASE_PROJECT_REF}-auth-token-user`),
    "known keys must include the -user companion key",
  );
  assert(
    getKnownSupabaseAuthStorageKeys().includes(`sb-${PRODUCTION_SUPABASE_PROJECT_REF}-auth-token`),
    "getKnownSupabaseAuthStorageKeys must include the live production JWT key",
  );
}

function withMockWindow(
  localStorage: Storage,
  sessionStorage: Storage,
  extra: { hostname?: string; cookie?: string; replace?: (url: string) => void } = {},
  run: () => void,
) {
  const originalWindow = globalThis.window;
  const originalDocument = (globalThis as { document?: unknown }).document;
  const cookies: string[] = [];
  const location = {
    hostname: extra.hostname ?? "comunidadenexus.com",
    replace: extra.replace ?? (() => undefined),
  };

  const originalLocalStorage = (globalThis as { localStorage?: Storage }).localStorage;
  const originalSessionStorage = (globalThis as { sessionStorage?: Storage }).sessionStorage;

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      localStorage,
      sessionStorage,
      location,
      addEventListener: () => undefined,
    },
  });
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: localStorage,
  });
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: sessionStorage,
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      get cookie() {
        return extra.cookie ?? "";
      },
      set cookie(value: string) {
        cookies.push(value);
      },
    },
  });

  try {
    run();
    return { cookies, location };
  } finally {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow,
    });
    if (originalLocalStorage === undefined) {
      delete (globalThis as { localStorage?: Storage }).localStorage;
    } else {
      Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        value: originalLocalStorage,
      });
    }
    if (originalSessionStorage === undefined) {
      delete (globalThis as { sessionStorage?: Storage }).sessionStorage;
    } else {
      Object.defineProperty(globalThis, "sessionStorage", {
        configurable: true,
        value: originalSessionStorage,
      });
    }
    if (originalDocument !== undefined) {
      Object.defineProperty(globalThis, "document", {
        configurable: true,
        value: originalDocument,
      });
    }
  }
}

function runProductionKeyWipeTests() {
  const prodToken = `sb-${PRODUCTION_SUPABASE_PROJECT_REF}-auth-token`;
  const prodChunk = `${prodToken}.0`;
  const prodUser = `${prodToken}-user`;
  const prodVerifier = `${prodToken}-code-verifier`;

  const localStorage = createMemoryStorage({
    [prodToken]: JSON.stringify({ access_token: "keep-me-out" }),
    [prodChunk]: "chunk",
    [prodUser]: JSON.stringify({ user: { id: "1" } }),
    [prodVerifier]: "pkce",
    "sb-proj-auth-token": JSON.stringify({ access_token: "legacy" }),
    theme: "dark",
    saved_posts: "[]",
    [FORCE_SIGNED_OUT_FLAG]: "stale",
  });
  const sessionStorage = createMemoryStorage({
    [prodVerifier]: "pkce-session",
    other: "1",
  });

  withMockWindow(localStorage, sessionStorage, { cookie: `${prodToken}=abc; theme=dark` }, () => {
    clearPersistedSupabaseAuth();
    assert(localStorage.getItem(prodToken) === null, "production auth token must be removed");
    assert(localStorage.getItem(prodChunk) === null, "production chunked token must be removed");
    assert(localStorage.getItem(prodUser) === null, "production -user key must be removed");
    assert(localStorage.getItem(prodVerifier) === null, "production PKCE verifier must be removed");
    assert(localStorage.getItem("sb-proj-auth-token") === null, "scanned leftover token must go");
    assert(localStorage.getItem("theme") === "dark", "theme should stay");
    assert(localStorage.getItem("saved_posts") === "[]", "saved posts should stay");
    assert(sessionStorage.getItem(prodVerifier) === null, "session PKCE verifier must be removed");
    assert(sessionStorage.getItem("other") === "1", "unrelated session key should stay");
  });
}

function runForceFlagAndHardRedirectTests() {
  const prodToken = `sb-${PRODUCTION_SUPABASE_PROJECT_REF}-auth-token`;
  const localStorage = createMemoryStorage({
    [prodToken]: JSON.stringify({ access_token: "revive-me" }),
  });
  const sessionStorage = createMemoryStorage();
  let redirectedTo = "";

  withMockWindow(
    localStorage,
    sessionStorage,
    {
      replace: (url) => {
        redirectedTo = url;
      },
    },
    () => {
      markForcedSignedOut();
      assert(hasForcedSignedOut() === true, "force flag must persist in localStorage");
      assert(hasClientSignedOut() === true, "session flag must also be set");
      assert(localStorage.getItem(FORCE_SIGNED_OUT_FLAG) === "1", "force flag value is 1");
      assert(sessionStorage.getItem(SIGNED_OUT_FLAG) === "1", "signed-out flag should persist");

      applyForcedSignOutOnBoot();
      assert(localStorage.getItem(prodToken) === null, "boot wipe must remove the production JWT");

      localStorage.setItem(prodToken, JSON.stringify({ access_token: "rewritten" }));
      performHardSignOut();
      assert(localStorage.getItem(prodToken) === null, "hard sign-out must wipe again");
      assert(redirectedTo === AUTH_REDIRECT_PATH, "hard sign-out must location.replace /auth");

      clearForcedSignedOut();
      assert(hasForcedSignedOut() === false, "login path must clear the force flag");
      assert(hasClientSignedOut() === false, "login path must clear the session flag");
    },
  );
}

function runSuccessfulSignInNeutralizesForceFlag() {
  assert(isExplicitSignInEvent("SIGNED_IN") === true, "SIGNED_IN is an explicit login");
  assert(isExplicitSignInEvent("TOKEN_REFRESHED") === false, "refresh is not an explicit login");
  assert(isExplicitSignInEvent("INITIAL_SESSION") === false, "initialize is not an explicit login");
  assert(isExplicitSignInEvent("SIGNED_OUT") === false, "sign-out is not an explicit login");

  assert(
    resolveForcedSignOutSession({
      event: "SIGNED_IN",
      hasSession: true,
      forcedSignedOut: true,
    }) === "accept-and-clear",
    "SIGNED_IN must neutralize the Sair flag instead of wiping the new JWT",
  );
  assert(
    resolveForcedSignOutSession({
      event: "TOKEN_REFRESHED",
      hasSession: true,
      forcedSignedOut: true,
    }) === "reject-and-wipe",
    "TOKEN_REFRESHED must not recover a wiped JWT while the flag is set",
  );
  assert(
    resolveForcedSignOutSession({
      event: "INITIAL_SESSION",
      hasSession: true,
      forcedSignedOut: true,
    }) === "reject-and-wipe",
    "INITIAL_SESSION / getSession must not recover a wiped JWT while the flag is set",
  );
  assert(
    resolveForcedSignOutSession({
      event: "INITIAL_SESSION",
      hasSession: false,
      forcedSignedOut: true,
    }) === "apply",
    "a null recovery session stays signed out without extra work",
  );
  assert(
    resolveForcedSignOutSession({
      event: "TOKEN_REFRESHED",
      hasSession: true,
      forcedSignedOut: false,
    }) === "apply",
    "after login, token refresh is a normal session update",
  );

  const prodToken = `sb-${PRODUCTION_SUPABASE_PROJECT_REF}-auth-token`;
  const wipedJwt = JSON.stringify({ access_token: "wiped-jwt", user: { id: "1" } });
  const freshJwt = JSON.stringify({ access_token: "fresh-login", user: { id: "1" } });
  const localStorage = createMemoryStorage({ [prodToken]: wipedJwt });
  const sessionStorage = createMemoryStorage();

  withMockWindow(localStorage, sessionStorage, {}, () => {
    markForcedSignedOut();
    clearPersistedSupabaseAuth();
    assert(localStorage.getItem(prodToken) === null, "Sair wipe removes the JWT");
    assert(hasForcedSignedOut() === true, "Sair leaves the force flag set");

    // GoTrue initialize() / a leftover rewrite must not come back before login.
    localStorage.setItem(prodToken, wipedJwt);
    assert(
      readStoredAuthSession() === null,
      "AuthContext / AdminRoute hydrate must ignore a JWT while the force flag is set",
    );
    applyForcedSignOutOnBoot();
    assert(
      localStorage.getItem(prodToken) === null,
      "boot wipe blocks JWT recovery while the force flag is set",
    );
    assert(
      hasForcedSignedOut() === true,
      "boot wipe must not clear the force flag — only a successful sign-in does",
    );

    const recovery = resolveForcedSignOutSession({
      event: "TOKEN_REFRESHED",
      hasSession: true,
      forcedSignedOut: hasForcedSignedOut(),
    });
    assert(recovery === "reject-and-wipe", "recovery events stay blocked until sign-in");
    if (recovery === "reject-and-wipe") {
      clearPersistedSupabaseAuth();
    }

    const signedIn = resolveForcedSignOutSession({
      event: "SIGNED_IN",
      hasSession: true,
      forcedSignedOut: hasForcedSignedOut(),
    });
    assert(signedIn === "accept-and-clear", "password SIGNED_IN is the success path");
    if (signedIn === "accept-and-clear") {
      noteSuccessfulSignIn();
    }
    assert(hasForcedSignedOut() === false, "successful sign-in clears nexus-force-signed-out");
    assert(hasClientSignedOut() === false, "successful sign-in clears the session signed-out flag");

    localStorage.setItem(prodToken, freshJwt);
    applyForcedSignOutOnBoot();
    assert(
      localStorage.getItem(prodToken) === freshJwt,
      "after successful sign-in, boot must not wipe the new JWT",
    );
    assert(
      readStoredAuthSession()?.access_token === "fresh-login",
      "after successful sign-in, /admin hydrate can read the new JWT",
    );
  });
}

function runLegacyWipeRegression() {
  const localStorage = createMemoryStorage({
    "sb-proj-auth-token": JSON.stringify({ access_token: "keep-me-out" }),
    "sb-proj-auth-token.0": "chunk",
    theme: "dark",
    saved_posts: "[]",
  });
  const sessionStorage = createMemoryStorage({
    "sb-proj-auth-token-code-verifier": "pkce",
    other: "1",
  });

  withMockWindow(localStorage, sessionStorage, {}, () => {
    clearPersistedSupabaseAuth();
    assert(localStorage.getItem("sb-proj-auth-token") === null, "auth token should be removed");
    assert(
      localStorage.getItem("sb-proj-auth-token.0") === null,
      "chunked token should be removed",
    );
    assert(localStorage.getItem("theme") === "dark", "theme should stay");
    assert(localStorage.getItem("saved_posts") === "[]", "saved posts should stay");
    assert(
      sessionStorage.getItem("sb-proj-auth-token-code-verifier") === null,
      "code verifier should be removed",
    );
    assert(sessionStorage.getItem("other") === "1", "unrelated session key should stay");

    markClientSignedOut();
    assert(sessionStorage.getItem(SIGNED_OUT_FLAG) === "1", "signed-out flag should persist");
    assert(hasClientSignedOut() === true, "hasClientSignedOut should read the flag");
    clearClientSignedOut();
    assert(hasClientSignedOut() === false, "clearClientSignedOut should drop the flag");
    assert(
      sessionStorage.getItem("other") === "1",
      "clearing the signed-out flag should not wipe other keys",
    );
  });
}

runKeyMatcherTests();
runProjectRefTests();
runProductionKeyWipeTests();
runForceFlagAndHardRedirectTests();
runSuccessfulSignInNeutralizesForceFlag();
runLegacyWipeRegression();
console.log("authStorage tests passed");
