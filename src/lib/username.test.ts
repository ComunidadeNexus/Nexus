import { isValidUsername, normalizeUsername } from "./username";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

assert(normalizeUsername("Joao") === "joao", "username is case-insensitive");
assert(normalizeUsername("Joao_1") === "joao_1", "underscore kept and lowercased");
assert(normalizeUsername("jo ao") === "joao", "spaces stripped");
assert(isValidUsername("joao"), "simple username is valid");
assert(isValidUsername("Joao"), "mixed case is valid before persist");
assert(!isValidUsername("ab"), "too short");
assert(!isValidUsername(""), "empty invalid");
assert(normalizeUsername("Joao") === normalizeUsername("JOAO"), "Joao vs JOAO collide");

console.log("username tests passed");
