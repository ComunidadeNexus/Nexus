import { buildPostsSearchOr, escapeIlikePattern, normalizeSearchQuery } from "./searchPosts";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

assert(normalizeSearchQuery("  QA  ") === "QA", "search query is trimmed");
assert(buildPostsSearchOr("   ") === null, "blank query does not build a filter");

const qa = buildPostsSearchOr("QA");
assert(qa !== null, "QA builds a filter");
assert(qa!.includes("title.ilike."), "title is searched");
assert(qa!.includes("content.ilike."), "content is searched");
assert(qa!.includes("%QA%"), "substring match includes QA");

const titled = buildPostsSearchOr("QA Post Test");
assert(titled!.includes("QA Post Test"), "multi-word titles stay intact");

assert(escapeIlikePattern("100%") === "100\\%", "% is escaped for ilike");
assert(escapeIlikePattern("a_b") === "a\\_b", "_ is escaped for ilike");

const comma = buildPostsSearchOr("foo,bar");
assert(comma !== null, "comma queries still build");
assert(comma!.startsWith('title.ilike."'), "values are quoted so commas do not break .or()");
assert(!comma!.includes("title.ilike.%foo,bar%"), "raw comma is not injected unquoted");

console.log("searchPosts tests passed");
