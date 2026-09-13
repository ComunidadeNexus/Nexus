/**
 * Admin dashboard counts two different things:
 * - premium role rows (manual grant, no Stripe required)
 * - subscriptions.status = active (Stripe)
 * Those numbers can legitimately diverge. Labels must say so.
 */

export interface PremiumMetricCard {
  title: string;
  trendLabel: string;
}

export function premiumAccessCard(): PremiumMetricCard {
  return {
    title: "Acesso Premium",
    trendLabel: "role premium (pode ser liberado sem Stripe)",
  };
}

export function activeSubscriptionsCard(): PremiumMetricCard {
  return {
    title: "Assinaturas ativas",
    trendLabel: "status=active no Stripe",
  };
}
