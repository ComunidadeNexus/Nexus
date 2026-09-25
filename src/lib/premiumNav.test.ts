import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

const sidebar = readFileSync(resolve("src/components/feed/LeftSidebar.tsx"), "utf8");
const navbar = readFileSync(resolve("src/components/Navbar.tsx"), "utf8");
const premiumPage = readFileSync(resolve("src/pages/PremiumArea.tsx"), "utf8");
const marketplacePage = readFileSync(resolve("src/pages/Marketplace.tsx"), "utf8");
const adminMarketplace = readFileSync(resolve("src/components/admin/AdminMarketplace.tsx"), "utf8");
const app = readFileSync(resolve("src/App.tsx"), "utf8");

assert(sidebar.includes("Área Premium"), "feed sidebar still lists Área Premium");
assert(
  sidebar.includes("ComingSoonRow") && sidebar.includes('label="Área Premium"'),
  "feed sidebar must mark Área Premium as Em breve",
);
assert(!sidebar.includes('to="/premium"'), "coming-soon Premium must not be a live sidebar link");
assert(
  sidebar.includes("ComingSoonRow") && sidebar.includes('label="Marketplace"'),
  "non-admin sidebar still marks Marketplace as Em breve",
);
assert(
  sidebar.includes("isAdmin") && sidebar.includes('to="/marketplace"'),
  "admin sidebar must open the live marketplace preview",
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
assert(marketplacePage.includes("Em breve"), "non-admin marketplace page stays coming soon");
assert(marketplacePage.includes("isAdmin"), "marketplace storefront is admin-gated");
assert(marketplacePage.includes("Categorias"), "storefront opens the categories panel");
assert(marketplacePage.includes("MarketplaceCategoriesDialog"), "categories dialog is wired");
assert(
  adminMarketplace.includes("Categorias da loja") &&
    adminMarketplace.includes("AdminMarketplaceCategories"),
  "admin marketplace must configure storefront categories",
);
assert(app.includes("NewListing"), "admins can open the new listing form");
assert(
  /path="\/marketplace\/novo"[\s\S]{0,80}<NewListing/.test(app),
  "creating a listing is mounted for the admin preview",
);

console.log("premiumNav tests passed");
