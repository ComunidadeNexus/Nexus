import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SubscriptionStatus {
  subscribed: boolean;
  tier: "free" | "pro" | "enterprise";
  subscriptionEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    tier: "free",
    subscriptionEnd: null,
    cancelAtPeriodEnd: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setStatus({
        subscribed: false,
        tier: "free",
        subscriptionEnd: null,
        cancelAtPeriodEnd: false,
      });
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      
      if (error) throw error;

      setStatus({
        subscribed: data.subscribed,
        tier: data.tier || "free",
        subscriptionEnd: data.subscription_end,
        cancelAtPeriodEnd: data.cancel_at_period_end || false,
      });
    } catch (error) {
      console.error("Error checking subscription:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const subscribe = async (tier: "pro" | "enterprise", interval: "monthly" | "yearly") => {
    if (!user) return { success: false, error: "Not authenticated" };

    setIsCheckingOut(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-subscription-checkout", {
        body: { tier, interval },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
        return { success: true, error: null };
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      return { success: false, error: error.message };
    } finally {
      setIsCheckingOut(false);
    }
  };

  const openCustomerPortal = async () => {
    if (!user) return { success: false, error: "Not authenticated" };

    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
        return { success: true, error: null };
      } else {
        throw new Error("No portal URL returned");
      }
    } catch (error: any) {
      console.error("Portal error:", error);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Auto-refresh subscription status every minute
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  return {
    ...status,
    isLoading,
    isCheckingOut,
    checkSubscription,
    subscribe,
    openCustomerPortal,
  };
};
