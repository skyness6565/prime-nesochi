import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserTransferFee {
  id: string;
  user_id: string;
  coin_id: string;
  symbol: string;
  fee_amount: number;
  created_at: string;
  updated_at: string;
}

// Fetch the transfer fees that apply to the currently signed-in user
export const useUserTransferFees = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["userTransferFees", user?.id],
    queryFn: async (): Promise<UserTransferFee[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_transfer_fees")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return (data || []).map((f) => ({
        ...f,
        fee_amount: parseFloat(String(f.fee_amount)),
      }));
    },
    enabled: !!user,
  });
};
