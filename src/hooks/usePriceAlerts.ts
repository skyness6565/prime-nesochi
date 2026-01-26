import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface PriceAlert {
  id: string;
  user_id: string;
  coin_id: string;
  symbol: string;
  target_price: number;
  condition: "above" | "below";
  is_active: boolean;
  triggered_at: string | null;
  created_at: string;
}

export const usePriceAlerts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const alertsQuery = useQuery({
    queryKey: ["price-alerts", user?.id],
    queryFn: async (): Promise<PriceAlert[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("price_alerts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map(a => ({
        ...a,
        target_price: parseFloat(String(a.target_price)),
        condition: a.condition as "above" | "below"
      }));
    },
    enabled: !!user,
  });

  const createAlertMutation = useMutation({
    mutationFn: async ({
      coinId,
      symbol,
      targetPrice,
      condition,
    }: {
      coinId: string;
      symbol: string;
      targetPrice: number;
      condition: "above" | "below";
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("price_alerts")
        .insert({
          user_id: user.id,
          coin_id: coinId,
          symbol,
          target_price: targetPrice,
          condition,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["price-alerts"] });
      toast({
        title: "Alert Created",
        description: "You'll be notified when the price reaches your target.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create alert",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("price_alerts")
        .delete()
        .eq("id", alertId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["price-alerts"] });
      toast({
        title: "Alert Deleted",
        description: "Price alert has been removed.",
      });
    },
  });

  const toggleAlertMutation = useMutation({
    mutationFn: async ({ alertId, isActive }: { alertId: string; isActive: boolean }) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("price_alerts")
        .update({ is_active: isActive })
        .eq("id", alertId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["price-alerts"] });
    },
  });

  return {
    alerts: alertsQuery.data || [],
    isLoading: alertsQuery.isLoading,
    createAlert: createAlertMutation.mutate,
    deleteAlert: deleteAlertMutation.mutate,
    toggleAlert: toggleAlertMutation.mutate,
    isCreating: createAlertMutation.isPending,
  };
};
