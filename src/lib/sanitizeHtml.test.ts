import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { stripHtml } from "./sanitizeHtml";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

assert(stripHtml("<p>Olá <b>Nexus</b></p>") === "Olá Nexus", "tags are removed");
assert(
  stripHtml('<img src=x onerror="alert(1)">safe') === "safe",
  "event-handler markup is not kept",
);
assert(stripHtml("a<br/>b") === "a\nb", "line breaks become newlines");
assert(!stripHtml("<script>alert(1)</script>").includes("script"), "script tags are dropped");

const newsModal = readFileSync(resolve("src/components/feed/NewsReaderModal.tsx"), "utf8");
assert(!newsModal.includes("dangerouslySetInnerHTML"), "news reader must not inject RSS HTML");
assert(newsModal.includes("stripHtml"), "news reader sanitizes RSS before render");

const gamesPage = readFileSync(resolve("src/pages/NexusGames.tsx"), "utf8");
assert(!gamesPage.includes("dangerouslySetInnerHTML"), "games news must not inject Steam HTML");

console.log("sanitizeHtml tests passed");
