import { readSavedPostIds, toggleSavedPost, writeSavedPostIds } from "./savedPosts";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

const store: Record<string, string> = {};
(globalThis as { localStorage?: Storage }).localStorage = {
  getItem: (key: string) => (key in store ? store[key] : null),
  setItem: (key: string, value: string) => {
    store[key] = value;
  },
  removeItem: (key: string) => {
    delete store[key];
  },
  clear: () => {
    for (const key of Object.keys(store)) delete store[key];
  },
  key: (index: number) => Object.keys(store)[index] ?? null,
  get length() {
    return Object.keys(store).length;
  },
};

store.saved_posts = "not-json";
assert(readSavedPostIds().length === 0, "corrupt saved_posts JSON must not throw");

store.saved_posts = '{"id":1}';
assert(readSavedPostIds().length === 0, "non-array saved_posts is ignored");

writeSavedPostIds(["a", "b"]);
assert(JSON.stringify(readSavedPostIds()) === JSON.stringify(["a", "b"]), "valid ids round-trip");

const toggled = toggleSavedPost("a");
assert(toggled.saved === false, "toggling an existing id unsaves it");
assert(JSON.stringify(toggled.ids) === JSON.stringify(["b"]), "other ids stay");

console.log("savedPosts tests passed");
