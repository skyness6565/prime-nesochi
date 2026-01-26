import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

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

  return {
    isAdmin: isAdminQuery.data || false,
    isCheckingAdmin: isAdminQuery.isLoading,
    users: usersQuery.data || [],
    settings: settingsQuery.data,
    isLoading: usersQuery.isLoading || settingsQuery.isLoading,
    fundAccount: fundAccountMutation.mutate,
    toggleFreeze: toggleFreezeMutation.mutate,
    updateFee: updateFeeMutation.mutate,
    isFunding: fundAccountMutation.isPending,
    isToggling: toggleFreezeMutation.isPending,
    isUpdatingFee: updateFeeMutation.isPending,
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
