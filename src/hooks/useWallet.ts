import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface Wallet {
  id: string;
  user_id: string;
  coin_id: string;
  symbol: string;
  name: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: "send" | "receive" | "swap";
  coin_id: string;
  symbol: string;
  amount: number;
  to_address?: string;
  from_address?: string;
  status: "pending" | "completed" | "failed";
  tx_hash?: string;
  created_at: string;
}

export const useWallet = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const walletsQuery = useQuery({
    queryKey: ["wallets", user?.id],
    queryFn: async (): Promise<Wallet[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .order("balance", { ascending: false });

      if (error) throw error;
      return (data || []).map(w => ({
        ...w,
        balance: parseFloat(String(w.balance))
      }));
    },
    enabled: !!user,
  });

  const transactionsQuery = useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: async (): Promise<Transaction[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []).map(t => ({
        ...t,
        amount: parseFloat(String(t.amount)),
        type: t.type as "send" | "receive" | "swap",
        status: t.status as "pending" | "completed" | "failed"
      }));
    },
    enabled: !!user,
  });

  const addWalletMutation = useMutation({
    mutationFn: async (wallet: Omit<Wallet, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("wallets")
        .upsert({
          user_id: wallet.user_id,
          coin_id: wallet.coin_id,
          symbol: wallet.symbol,
          name: wallet.name,
          balance: wallet.balance,
        }, { onConflict: "user_id,coin_id" })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
    },
  });

  const sendCryptoMutation = useMutation({
    mutationFn: async ({
      coinId,
      symbol,
      amount,
      toAddress,
    }: {
      coinId: string;
      symbol: string;
      amount: number;
      toAddress: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Get current wallet balance
      const { data: wallet, error: walletError } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .eq("coin_id", coinId)
        .maybeSingle();

      if (walletError) throw walletError;
      
      const currentBalance = wallet ? parseFloat(String(wallet.balance)) : 0;
      
      if (currentBalance < amount) {
        throw new Error("Insufficient balance");
      }

      // Update wallet balance
      const newBalance = currentBalance - amount;
      const { error: updateError } = await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("user_id", user.id)
        .eq("coin_id", coinId);

      if (updateError) throw updateError;

      // Create transaction record
      const { error: txError } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          type: "send",
          coin_id: coinId,
          symbol,
          amount: amount,
          to_address: toAddress,
          status: "completed",
          tx_hash: `0x${Math.random().toString(16).slice(2)}`,
        });

      if (txError) throw txError;

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast({
        title: "Transaction Sent",
        description: "Your transaction has been submitted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Transaction Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const receiveCryptoMutation = useMutation({
    mutationFn: async ({
      coinId,
      symbol,
      name,
      amount,
      fromAddress,
    }: {
      coinId: string;
      symbol: string;
      name: string;
      amount: number;
      fromAddress: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Get or create wallet
      const { data: existingWallet } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .eq("coin_id", coinId)
        .maybeSingle();

      const currentBalance = existingWallet 
        ? parseFloat(String(existingWallet.balance)) 
        : 0;
      const newBalance = currentBalance + amount;

      if (existingWallet) {
        await supabase
          .from("wallets")
          .update({ balance: newBalance })
          .eq("id", existingWallet.id);
      } else {
        await supabase
          .from("wallets")
          .insert({
            user_id: user.id,
            coin_id: coinId,
            symbol,
            name,
            balance: newBalance,
          });
      }

      // Create transaction record
      await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          type: "receive",
          coin_id: coinId,
          symbol,
          amount: amount,
          from_address: fromAddress,
          status: "completed",
          tx_hash: `0x${Math.random().toString(16).slice(2)}`,
        });

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  return {
    wallets: walletsQuery.data || [],
    transactions: transactionsQuery.data || [],
    isLoading: walletsQuery.isLoading || transactionsQuery.isLoading,
    addWallet: addWalletMutation.mutate,
    sendCrypto: sendCryptoMutation.mutate,
    receiveCrypto: receiveCryptoMutation.mutate,
    isSending: sendCryptoMutation.isPending,
  };
};
