import {
  analyticsErrorMessage,
  buildDailyStats,
  canFilterByPostIds,
  chunkIds,
  emptyAnalytics,
  periodToDays,
  pickTopPosts,
  readFollowerGrowth,
  withTimeout,
} from "./analytics";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

assert(periodToDays("7d") === 7, "7d is 7 days");
assert(periodToDays("30d") === 30, "30d is 30 days");
assert(periodToDays("90d") === 90, "90d is 90 days");

assert(canFilterByPostIds(["a"]) === true, "non-empty ids can be used in .in()");
assert(canFilterByPostIds([]) === false, "empty .in() must be skipped — it hangs");
assert(canFilterByPostIds(null) === false, "null ids must be skipped");
assert(canFilterByPostIds(undefined) === false, "undefined ids must be skipped");

assert(chunkIds([]).length === 0, "no chunks for empty ids");
assert(chunkIds(["a", "b", "c"], 2).length === 2, "ids are chunked");
assert(chunkIds(["a", "b", "c"], 2)[0].join(",") === "a,b", "first chunk keeps order");
assert(chunkIds(["a", "b", "c"], 2)[1].join(",") === "c", "remainder is a final chunk");

const top = pickTopPosts([
  {
    id: "low",
    content: "low",
    likes_count: 1,
    comments_count: 0,
    created_at: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "high",
    content: "high",
    likes_count: 4,
    comments_count: 3,
    created_at: "2026-09-02T00:00:00.000Z",
  },
  {
    id: "mid",
    content: null,
    likes_count: null,
    comments_count: 2,
    created_at: "2026-09-03T00:00:00.000Z",
  },
]);
assert(top[0].id === "high", "top post is highest likes+comments");
assert(top[0].likes_count === 4 && top[0].comments_count === 3, "counts are preserved");
assert(top[1].id === "mid", "null likes count as 0");
assert(top[1].content === "", "null content becomes empty string");

const empty = emptyAnalytics();
assert(empty.totalPosts === 0 && empty.topPosts.length === 0, "empty analytics is zeros");
assert(readFollowerGrowth(true, { count: 12 }) === 12, "admin uses profiles count");
assert(
  readFollowerGrowth(false, { data: { followers_count: 4 } }) === 4,
  "user uses followers_count",
);
assert(readFollowerGrowth(false, { data: [] }) === 0, "array payload is ignored");

const start = new Date("2026-09-01T12:00:00.000Z");
const end = new Date("2026-09-02T12:00:00.000Z");
const daily = buildDailyStats(
  start,
  end,
  [{ created_at: "2026-09-01T15:00:00.000Z" }],
  [{ created_at: "2026-09-02T08:00:00.000Z" }],
  [],
);
assert(daily.length === 2, "one bucket per day in the interval");
assert(daily[0].posts === 1 && daily[0].likes === 0, "posts land on the created day");
assert(daily[1].posts === 0 && daily[1].likes === 1, "likes land on the created day");

assert(
  analyticsErrorMessage(new Error("Analytics fetch timed out")).includes("tempo"),
  "timeout errors are user-facing",
);
assert(
  analyticsErrorMessage(Object.assign(new Error("aborted"), { name: "AbortError" })).includes(
    "tempo",
  ),
  "abort errors are user-facing",
);
assert(
  analyticsErrorMessage(new Error("permission denied")) === "permission denied",
  "query errors keep the server message",
);
assert(analyticsErrorMessage("nope").includes("Não foi possível"), "unknown errors get a fallback");

const timedOut = await withTimeout(new Promise((resolve) => setTimeout(resolve, 50)), 5).then(
  () => "resolved",
  (error: Error) => error.message,
);
assert(timedOut.includes("timed out"), "withTimeout rejects when the work exceeds the cap");

const finished = await withTimeout(Promise.resolve(42), 50);
assert(finished === 42, "withTimeout returns the value when it finishes in time");

console.log("analytics tests passed");
