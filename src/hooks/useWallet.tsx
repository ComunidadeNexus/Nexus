import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  description: string | null;
  reference_id: string | null;
  reference_type: string | null;
  created_at: string;
}

interface CoinPackage {
  id: string;
  name: string;
  description: string | null;
  coins: number;
  bonus_coins: number;
  price: number;
  currency: string;
  is_popular: boolean;
  is_active: boolean;
}

export const useWallet = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWallet = useCallback(async () => {
    if (!user) {
      setWallet(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_wallets")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Create wallet if it doesn't exist
        const { data: newWallet, error: createError } = await supabase
          .from("user_wallets")
          .insert({ user_id: user.id, balance: 0 })
          .select()
          .single();

        if (createError) throw createError;
        setWallet(newWallet);
      } else {
        setWallet(data);
      }
    } catch (error) {
      console.error("Error fetching wallet:", error);
    }
  }, [user]);

  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("coin_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }, [user]);

  const fetchPackages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("coin_packages")
        .select("*")
        .eq("is_active", true)
        .order("price", { ascending: true });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error("Error fetching packages:", error);
    }
  }, []);

  const spendCoins = async (amount: number, description: string, referenceId?: string, referenceType?: string) => {
    if (!user) return { success: false, error: "Não autenticado" };
    if (!wallet || wallet.balance < amount) return { success: false, error: "Saldo insuficiente" };

    try {
      // Use atomic SECURITY DEFINER function to prevent race conditions
      const { data, error } = await supabase.rpc("process_coin_transaction", {
        p_user_id: user.id,
        p_amount: amount,
        p_type: "spend",
        p_description: description,
        p_reference_id: referenceId || null,
        p_reference_type: referenceType || null,
      });

      if (error) throw error;
      if (!data) return { success: false, error: "Saldo insuficiente" };

      // Refresh wallet data
      await fetchWallet();
      await fetchTransactions();

      return { success: true, error: null };
    } catch (error: any) {
      console.error("Error spending coins:", error);
      return { success: false, error: error.message };
    }
  };

  const addCoins = async (amount: number, type: "reward", description: string) => {
    if (!user) return { success: false, error: "Não autenticado" };
    
    // Only 'reward' type is allowed from client - 'purchase' requires server-side payment validation
    if (type !== "reward") {
      return { success: false, error: "Tipo de transação inválido" };
    }

    try {
      // Use atomic SECURITY DEFINER function to prevent race conditions
      const { data, error } = await supabase.rpc("process_coin_transaction", {
        p_user_id: user.id,
        p_amount: amount,
        p_type: type,
        p_description: description,
        p_reference_id: null,
        p_reference_type: null,
      });

      if (error) throw error;

      // Refresh wallet data
      await fetchWallet();
      await fetchTransactions();

      return { success: true, error: null };
    } catch (error: any) {
      console.error("Error adding coins:", error);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchWallet(), fetchTransactions(), fetchPackages()]);
      setIsLoading(false);
    };

    loadData();
  }, [user, fetchWallet, fetchTransactions, fetchPackages]);

  return {
    wallet,
    transactions,
    packages,
    isLoading,
    spendCoins,
    addCoins,
    refetch: () => Promise.all([fetchWallet(), fetchTransactions()]),
  };
};