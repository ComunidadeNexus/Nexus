import { displayPostAuthor, displayPostTitle, mapFeedPost, mapFeedPosts, resolvePostTitle } from "./feedPosts";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

const qaRow = {
  id: "3197ad2b-28c9-49e0-81da-1c4e9c600cb7",
  user_id: "user-1",
  nucleo_id: null,
  title: "QA Post Test",
  content: "Conteúdo de teste funcional mobile para validar curtidas e comentários.",
  media_url: null,
  media_type: null,
  upvotes: 0,
  downvotes: 0,
  comments_count: 1,
  created_at: "2026-09-12T23:43:38.774176+00",
};

assert(
  resolvePostTitle(qaRow) === "QA Post Test",
  "published title must stay the title, not the body",
);

const mapped = mapFeedPost(qaRow);
assert(mapped !== null, "valid QA row must map");
assert(mapped?.title === "QA Post Test", "mapped title must not become the body");
assert(
  mapped?.content === "Conteúdo de teste funcional mobile para validar curtidas e comentários.",
  "body must stay in content",
);
assert(displayPostTitle(mapped!) === "QA Post Test", "display title uses the stored title");
assert(mapped?.comments_count === 1, "comments_count must be preserved");
assert(mapped?.upvotes_count === 0 && mapped?.downvotes_count === 0, "vote counts default safely");

const bodyAsTitle = resolvePostTitle({
  title: null,
  content: "Conteúdo de teste funcional mobile para validar curtidas e comentários.",
});
assert(bodyAsTitle === null, "missing title must not be invented from content");
assert(displayPostTitle({ title: null }) === "Sem Título", "null title shows fallback, not the body");

assert(mapFeedPost({}) === null, "row without id/user_id is dropped");
assert(mapFeedPosts(null).length === 0, "null rows become an empty list");
assert(mapFeedPosts([null as never, qaRow, { id: "x" }]).length === 1, "invalid rows are skipped");

assert(displayPostAuthor({ author: null }) === "Usuário", "missing author is safe");
assert(
  displayPostAuthor({ author: { name: null, username: "qa", avatar_url: null } }) === "qa",
  "username is used when name is empty",
);

const garbage = mapFeedPosts([
  {
    id: "ok",
    user_id: "u1",
    title: 123,
    content: { nested: true },
    upvotes: "2",
    comments_count: undefined,
    created_at: "not-a-date",
  },
]);
assert(garbage.length === 1, "garbage row still maps when id/user exist");
assert(garbage[0].title === null, "non-string title is ignored");
assert(garbage[0].content === "", "non-string content becomes empty string");
assert(garbage[0].upvotes_count === 2, "numeric strings are accepted as counts");
assert(typeof garbage[0].created_at === "string", "invalid dates become a safe ISO string");

console.log("feedPosts tests passed");
