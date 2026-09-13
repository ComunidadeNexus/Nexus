import { slugifyNucleoName, uniquifyNucleoSlug } from "./nucleoSlug";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

assert(
  slugifyNucleoName("QA Mobile Test Núcleo") === "qa-mobile-test-nucleo",
  "accents and spaces must fold into a stable slug",
);
assert(slugifyNucleoName("QA Desktop Nucleo") === "qa-desktop-nucleo", "plain names stay readable");
assert(slugifyNucleoName("   ") === "comunidade", "blank names get a fallback slug");
assert(slugifyNucleoName("***") === "comunidade", "punctuation-only names get a fallback slug");
assert(uniquifyNucleoSlug("qa-desktop-nucleo", 0) === "qa-desktop-nucleo", "first attempt is the base");
assert(
  uniquifyNucleoSlug("qa-desktop-nucleo", 1) === "qa-desktop-nucleo-2",
  "retry appends a numeric suffix",
);

console.log("nucleoSlug tests passed");
