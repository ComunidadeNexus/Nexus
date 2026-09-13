import { activeSubscriptionsCard, premiumAccessCard } from "./adminMetrics";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

const premium = premiumAccessCard();
const subs = activeSubscriptionsCard();

assert(premium.title !== subs.title, "the two metrics keep distinct titles");
assert(/role/i.test(premium.trendLabel), "premium card explains the role source");
assert(/stripe/i.test(subs.trendLabel), "subscriptions card names Stripe");
assert(!/usuários premium/i.test(premium.title), "do not imply every premium user has a paid sub");

console.log("adminMetrics tests passed");
