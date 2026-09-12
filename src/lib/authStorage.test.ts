import {
  SIGNED_OUT_FLAG,
  clearClientSignedOut,
  clearPersistedSupabaseAuth,
  hasClientSignedOut,
  isSupabaseAuthStorageKey,
  markClientSignedOut,
} from "./authStorage";

const KEY_CASES: Array<[string, boolean]> = [
  ["sb-abcdef-auth-token", true],
  ["sb-abcdef-auth-token.0", true],
  ["sb-abcdef-auth-token.1", true],
  ["sb-abcdef-auth-token-code-verifier", true],
  ["theme", false],
  ["saved_posts", false],
  ["nexus-theme", false],
];

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

function runKeyMatcherTests() {
  for (const [key, expected] of KEY_CASES) {
    assert(
      isSupabaseAuthStorageKey(key) === expected,
      `isSupabaseAuthStorageKey(${key}) should be ${expected}`,
    );
  }
}

function createMemoryStorage(initial: Record<string, string>): Storage {
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

function runStorageWipeTests() {
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

  const originalWindow = globalThis.window;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { localStorage, sessionStorage, location: { hostname: "localhost" } },
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { cookie: "sb-proj-auth-token=abc; theme=dark" },
    writable: true,
  });

  try {
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
  } finally {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow,
    });
  }
}

runKeyMatcherTests();
runStorageWipeTests();
console.log("authStorage tests passed");
