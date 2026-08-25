import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface UserWalletAddress {
  id: string;
  coin_id: string;
  symbol: string;
  network: string;
  wallet_address: string;
}

export interface UserTransferFee {
  id: string;
  user_id: string;
  coin_id: string;
  symbol: string;
  fee_amount: number;
  created_at: string;
  updated_at: string;
}

export interface UserWithProfile {
  id: string;
  email: string;
  created_at: string;
  profile: {
    display_name: string | null;
    username: string | null;
    full_name: string | null;
    country: string | null;
    avatar_url: string | null;
    is_frozen: boolean;
    frozen_at: string | null;
    frozen_reason: string | null;
  } | null;
  wallets: {
    id: string;
    coin_id: string;
    symbol: string;
    name: string;
    balance: number;
  }[];
  walletAddresses: UserWalletAddress[];
}

export interface AppSettings {
  transaction_fee: {
    percentage: number;
    min_fee_usd: number;
  };
}

export const useAdmin = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if current user is admin
  const isAdminQuery = useQuery({
    queryKey: ["isAdmin", user?.id],
    queryFn: async (): Promise<boolean> => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' });

      if (error) {
        console.error("Error checking admin status:", error);
        return false;
      }
      return data || false;
    },
    enabled: !!user,
  });

  // Get all users with their profiles and wallets
  const usersQuery = useQuery({
    queryKey: ["adminUsers"],
    queryFn: async (): Promise<UserWithProfile[]> => {
      // Get all profiles (admin can see all)
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Get all wallets
      const { data: wallets, error: walletsError } = await supabase
        .from("wallets")
        .select("*");

      if (walletsError) throw walletsError;

      // Get all wallet addresses
      const { data: walletAddresses, error: addressesError } = await supabase
        .from("user_wallets")
        .select("*");

      if (addressesError) throw addressesError;

      // Map profiles to users
      return (profiles || []).map((profile) => ({
        id: profile.user_id,
        email: profile.username || profile.display_name || "Unknown",
        created_at: profile.created_at,
        profile: {
          display_name: profile.display_name,
          username: profile.username,
          full_name: profile.full_name,
          country: profile.country,
          avatar_url: profile.avatar_url,
          is_frozen: profile.is_frozen,
          frozen_at: profile.frozen_at,
          frozen_reason: profile.frozen_reason,
        },
        wallets: (wallets || [])
          .filter((w) => w.user_id === profile.user_id)
          .map((w) => ({
            id: w.id,
            coin_id: w.coin_id,
            symbol: w.symbol,
            name: w.name,
            balance: parseFloat(String(w.balance)),
          })),
        walletAddresses: (walletAddresses || [])
          .filter((wa) => wa.user_id === profile.user_id)
          .map((wa) => ({
            id: wa.id,
            coin_id: wa.coin_id,
            symbol: wa.symbol,
            network: wa.network,
            wallet_address: wa.wallet_address,
          })),
      }));
    },
    enabled: isAdminQuery.data === true,
  });

  // Get app settings
  const settingsQuery = useQuery({
    queryKey: ["appSettings"],
    queryFn: async (): Promise<AppSettings> => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("*")
        .eq("key", "transaction_fee")
        .single();

      if (error) throw error;
      
      return {
        transaction_fee: data.value as { percentage: number; min_fee_usd: number },
      };
    },
    enabled: isAdminQuery.data === true,
  });

  // Get all per-user transfer fees
  const transferFeesQuery = useQuery({
    queryKey: ["adminTransferFees"],
    queryFn: async (): Promise<UserTransferFee[]> => {
      const { data, error } = await supabase
        .from("user_transfer_fees")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((f) => ({
        ...f,
        fee_amount: parseFloat(String(f.fee_amount)),
      }));
    },
    enabled: isAdminQuery.data === true,
  });

  // Fund user account
  const fundAccountMutation = useMutation({
    mutationFn: async ({
      userId,
      coinId,
      symbol,
      name,
      amount,
    }: {
      userId: string;
      coinId: string;
      symbol: string;
      name: string;
      amount: number;
    }) => {
      // Check if wallet exists
      const { data: existingWallet } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", userId)
        .eq("coin_id", coinId)
        .maybeSingle();

      if (existingWallet) {
        // Update existing wallet
        const newBalance = parseFloat(String(existingWallet.balance)) + amount;
        const { error } = await supabase
          .from("wallets")
          .update({ balance: newBalance })
          .eq("id", existingWallet.id);
        if (error) throw error;
      } else {
        // Create new wallet
        const { error } = await supabase
          .from("wallets")
          .insert({
            user_id: userId,
            coin_id: coinId,
            symbol,
            name,
            balance: amount,
          });
        if (error) throw error;
      }

      // Log admin action
      await supabase.from("admin_actions").insert({
        admin_id: user?.id,
        action_type: "fund_account",
        target_user_id: userId,
        details: { coin_id: coinId, symbol, amount },
      });

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast({
        title: "Account Funded",
        description: "User account has been funded successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Fund Account",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Freeze/Unfreeze account
  const toggleFreezeMutation = useMutation({
    mutationFn: async ({
      userId,
      freeze,
      reason,
    }: {
      userId: string;
      freeze: boolean;
      reason?: string;
    }) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_frozen: freeze,
          frozen_at: freeze ? new Date().toISOString() : null,
          frozen_reason: freeze ? reason : null,
        })
        .eq("user_id", userId);

      if (error) throw error;

      // Log admin action
      await supabase.from("admin_actions").insert({
        admin_id: user?.id,
        action_type: freeze ? "freeze_account" : "unfreeze_account",
        target_user_id: userId,
        details: { reason },
      });

      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast({
        title: variables.freeze ? "Account Frozen" : "Account Unfrozen",
        description: `User account has been ${variables.freeze ? "frozen" : "unfrozen"}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update transaction fee
  const updateFeeMutation = useMutation({
    mutationFn: async ({
      percentage,
      minFeeUsd,
    }: {
      percentage: number;
      minFeeUsd: number;
    }) => {
      const { error } = await supabase
        .from("app_settings")
        .update({
          value: { percentage, min_fee_usd: minFeeUsd },
          updated_at: new Date().toISOString(),
          updated_by: user?.id,
        })
        .eq("key", "transaction_fee");

      if (error) throw error;

      // Log admin action
      await supabase.from("admin_actions").insert({
        admin_id: user?.id,
        action_type: "update_transaction_fee",
        details: { percentage, min_fee_usd: minFeeUsd },
      });

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appSettings"] });
      toast({
        title: "Fee Updated",
        description: "Transaction fee has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Update Fee",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Deduct a fee from a user's wallet with narration
  const deductFeeMutation = useMutation({
    mutationFn: async ({
      userId,
      walletId,
      coinId,
      symbol,
      amount,
      narration,
      currentBalance,
    }: {
      userId: string;
      walletId: string;
      coinId: string;
      symbol: string;
      amount: number;
      narration: string;
      currentBalance: number;
    }) => {
      if (amount <= 0) throw new Error("Fee amount must be greater than zero");
      if (amount > currentBalance) throw new Error("Fee exceeds wallet balance");

      // Deduct from wallet balance
      const newBalance = currentBalance - amount;
      const { error: walletError } = await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("id", walletId);
      if (walletError) throw walletError;

      // Record the fee in the user's transaction history with the narration
      const { error: txError } = await supabase.from("transactions").insert({
        user_id: userId,
        type: "fee",
        coin_id: coinId,
        symbol,
        amount,
        status: "completed",
        note: narration,
      });
      if (txError) throw txError;

      // Log admin action
      await supabase.from("admin_actions").insert({
        admin_id: user?.id,
        action_type: "deduct_fee",
        target_user_id: userId,
        details: { coin_id: coinId, symbol, amount, narration },
      });

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast({
        title: "Fee Deducted",
        description: "The fee has been deducted from the user's wallet.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Deduct Fee",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update or create wallet address
  const updateWalletAddressMutation = useMutation({
    mutationFn: async ({
      userId,
      coinId,
      symbol,
      network,
      walletAddress,
      existingId,
    }: {
      userId: string;
      coinId: string;
      symbol: string;
      network: string;
      walletAddress: string;
      existingId?: string;
    }) => {
      if (existingId) {
        // Update existing wallet address
        const { error } = await supabase
          .from("user_wallets")
          .update({ wallet_address: walletAddress })
          .eq("id", existingId);
        if (error) throw error;
      } else {
        // Create new wallet address
        const { error } = await supabase
          .from("user_wallets")
          .insert({
            user_id: userId,
            coin_id: coinId,
            symbol,
            network,
            wallet_address: walletAddress,
          });
        if (error) throw error;
      }

      // Log admin action
      await supabase.from("admin_actions").insert({
        admin_id: user?.id,
        action_type: "update_wallet_address",
        target_user_id: userId,
        details: { coin_id: coinId, symbol, network, wallet_address: walletAddress },
      });

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast({
        title: "Wallet Address Updated",
        description: "User wallet address has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Update Address",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Set or update a per-user, per-crypto transfer fee
  const setTransferFeeMutation = useMutation({
    mutationFn: async ({
      userId,
      coinId,
      symbol,
      feeAmount,
    }: {
      userId: string;
      coinId: string;
      symbol: string;
      feeAmount: number;
    }) => {
      if (feeAmount < 0) throw new Error("Fee cannot be negative");

      const { error } = await supabase
        .from("user_transfer_fees")
        .upsert(
          {
            user_id: userId,
            coin_id: coinId,
            symbol,
            fee_amount: feeAmount,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,coin_id" }
        );

      if (error) throw error;

      // Log admin action
      await supabase.from("admin_actions").insert({
        admin_id: user?.id,
        action_type: "set_transfer_fee",
        target_user_id: userId,
        details: { coin_id: coinId, symbol, fee_amount: feeAmount },
      });

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTransferFees"] });
      queryClient.invalidateQueries({ queryKey: ["userTransferFees"] });
      toast({
        title: "Transfer Fee Set",
        description: "The user's transfer fee has been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Set Transfer Fee",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove a per-user transfer fee
  const removeTransferFeeMutation = useMutation({
    mutationFn: async ({
      feeId,
      userId,
      symbol,
    }: {
      feeId: string;
      userId: string;
      symbol: string;
    }) => {
      const { error } = await supabase
        .from("user_transfer_fees")
        .delete()
        .eq("id", feeId);

      if (error) throw error;

      // Log admin action
      await supabase.from("admin_actions").insert({
        admin_id: user?.id,
        action_type: "remove_transfer_fee",
        target_user_id: userId,
        details: { symbol },
      });

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTransferFees"] });
      queryClient.invalidateQueries({ queryKey: ["userTransferFees"] });
      toast({
        title: "Transfer Fee Removed",
        description: "The transfer fee has been removed for this user.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Remove Fee",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    isAdmin: isAdminQuery.data || false,
    isCheckingAdmin: isAdminQuery.isLoading,
    users: usersQuery.data || [],
    settings: settingsQuery.data,
    transferFees: transferFeesQuery.data || [],
    isLoading: usersQuery.isLoading || settingsQuery.isLoading,
    fundAccount: fundAccountMutation.mutate,
    toggleFreeze: toggleFreezeMutation.mutate,
    updateFee: updateFeeMutation.mutate,
    updateWalletAddress: updateWalletAddressMutation.mutate,
    deductFee: deductFeeMutation.mutate,
    setTransferFee: setTransferFeeMutation.mutate,
    removeTransferFee: removeTransferFeeMutation.mutate,
    isFunding: fundAccountMutation.isPending,
    isToggling: toggleFreezeMutation.isPending,
    isUpdatingFee: updateFeeMutation.isPending,
    isUpdatingAddress: updateWalletAddressMutation.isPending,
    isDeductingFee: deductFeeMutation.isPending,
    isSettingTransferFee: setTransferFeeMutation.isPending,
    isRemovingTransferFee: removeTransferFeeMutation.isPending,
  };
};

// Hook to get transaction fee for use in wallet operations
export const useTransactionFee = () => {
  return useQuery({
    queryKey: ["transactionFee"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "transaction_fee")
        .single();

      if (error) {
        return { percentage: 0.02, min_fee_usd: 0.5 };
      }
      
      return data.value as { percentage: number; min_fee_usd: number };
    },
  });
};

// Hook to check if account is frozen
export const useAccountStatus = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["accountStatus", user?.id],
    queryFn: async () => {
      if (!user) return { is_frozen: false };
      
      const { data, error } = await supabase
        .from("profiles")
        .select("is_frozen, frozen_reason")
        .eq("user_id", user.id)
        .single();

      if (error) return { is_frozen: false };
      
      return {
        is_frozen: data.is_frozen || false,
        frozen_reason: data.frozen_reason,
      };
    },
    enabled: !!user,
  });
};
