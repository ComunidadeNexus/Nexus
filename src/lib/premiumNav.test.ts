import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

const sidebar = readFileSync(resolve("src/components/feed/LeftSidebar.tsx"), "utf8");
const navbar = readFileSync(resolve("src/components/Navbar.tsx"), "utf8");
const premiumPage = readFileSync(resolve("src/pages/PremiumArea.tsx"), "utf8");

assert(sidebar.includes("Área Premium"), "feed sidebar still lists Área Premium");
assert(
  sidebar.includes("ComingSoonRow") && sidebar.includes('label="Área Premium"'),
  "feed sidebar must mark Área Premium as Em breve",
);
assert(!sidebar.includes('to="/premium"'), "coming-soon Premium must not be a live sidebar link");
assert(
  sidebar.includes("Em breve") && sidebar.includes('label="Marketplace"'),
  "unrelated coming-soon items stay coming soon",
);
assert(
  sidebar.includes("ComingSoonRow") && sidebar.includes('label="Produtos"'),
  "feed sidebar must mark Produtos as Em breve",
);
assert(!sidebar.includes('to="/produtos"'), "coming-soon Produtos must not be a live sidebar link");
assert(!sidebar.includes("Começar a vender"), "Começar a vender must leave the user sidebar");
assert(!sidebar.includes("Painel do Produtor"), "producer panel must leave the user sidebar");
assert(
  sidebar.includes('useState(variant !== "drawer")'),
  "mobile drawer must start with Assuntos collapsed so Plataforma is visible",
);
assert(
  sidebar.includes("isDrawer ?") && sidebar.includes("{plataformaSection}"),
  "mobile drawer must show Plataforma before Assuntos",
);

assert(navbar.includes('navigate("/premium")'), "navbar Premium still opens /premium");
assert(premiumPage.includes("Em breve"), "premium page itself is coming soon");

console.log("premiumNav tests passed");
