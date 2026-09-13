import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

const sidebar = readFileSync(resolve("src/components/feed/LeftSidebar.tsx"), "utf8");
const navbar = readFileSync(resolve("src/components/Navbar.tsx"), "utf8");

assert(sidebar.includes('to="/premium"'), "feed sidebar must link Área Premium to /premium");
assert(
  !/Área Premium[\s\S]{0,240}Em breve/.test(sidebar),
  "feed sidebar must not call live Premium 'Em breve'",
);
assert(
  sidebar.includes("Em breve") && sidebar.includes("Marketplace"),
  "unrelated coming-soon items stay coming soon",
);

assert(navbar.includes('navigate("/premium")'), "navbar Premium goes to /premium");
assert(
  !/Área Premium[\s\S]{0,240}Em breve/.test(navbar),
  "navbar must not call live Premium 'Em breve'",
);

console.log("premiumNav tests passed");
