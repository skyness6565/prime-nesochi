import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserWallet {
  id: string;
  user_id: string;
  coin_id: string;
  symbol: string;
  network: string;
  wallet_address: string;
  created_at: string;
}

// Default wallet addresses for new users
const DEFAULT_WALLETS = [
  { coin_id: "bitcoin", symbol: "BTC", network: "Bitcoin", wallet_address: "114deTkH9FJMbE1mKVrVn95MbkDX7bWMoy" },
  { coin_id: "ethereum", symbol: "ETH", network: "Ethereum", wallet_address: "0x3a7d57b99cb20bcc0f651544e5d98000fa5ca3f7" },
  { coin_id: "solana", symbol: "SOL", network: "Solana", wallet_address: "5Zxr4aXYoFbpNPHm6H8e3gZ5vsLBRgL6DzmUrQVHbzTG" },
  { coin_id: "binancecoin", symbol: "BNB", network: "BNB Smart Chain", wallet_address: "0x3a7d57b99cb20bcc0f651544e5d98000fa5ca3f7" },
];

// Network configurations for each crypto
export const CRYPTO_NETWORKS: Record<string, { name: string; prefix: string }[]> = {
  bitcoin: [
    { name: "Bitcoin", prefix: "1" },
    { name: "Bitcoin (SegWit)", prefix: "bc1" },
  ],
  ethereum: [
    { name: "Ethereum", prefix: "0x" },
    { name: "Arbitrum", prefix: "0x" },
    { name: "Optimism", prefix: "0x" },
    { name: "Polygon", prefix: "0x" },
  ],
  solana: [
    { name: "Solana", prefix: "" },
  ],
  binancecoin: [
    { name: "BNB Smart Chain", prefix: "0x" },
    { name: "BNB Beacon Chain", prefix: "bnb1" },
  ],
  tether: [
    { name: "Ethereum (ERC-20)", prefix: "0x" },
    { name: "Tron (TRC-20)", prefix: "T" },
    { name: "Solana", prefix: "" },
  ],
  ripple: [
    { name: "XRP Ledger", prefix: "r" },
  ],
  cardano: [
    { name: "Cardano", prefix: "addr1" },
  ],
  dogecoin: [
    { name: "Dogecoin", prefix: "D" },
  ],
};

export const useUserWallets = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const walletsQuery = useQuery({
    queryKey: ["user-wallets", user?.id],
    queryFn: async (): Promise<UserWallet[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("user_wallets")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      
      // If no wallets exist, create default ones
      if (!data || data.length === 0) {
        const newWallets = DEFAULT_WALLETS.map(w => ({
          user_id: user.id,
          ...w
        }));
        
        const { data: insertedData, error: insertError } = await supabase
          .from("user_wallets")
          .insert(newWallets)
          .select();
          
        if (insertError) throw insertError;
        return insertedData as UserWallet[];
      }
      
      return data as UserWallet[];
    },
    enabled: !!user,
  });

  const findWalletByAddress = async (address: string): Promise<UserWallet | null> => {
    const { data, error } = await supabase
      .from("user_wallets")
      .select("*")
      .eq("wallet_address", address)
      .maybeSingle();

    if (error) return null;
    return data as UserWallet | null;
  };

  const getWalletAddress = (coinId: string, network?: string): string | undefined => {
    const wallets = walletsQuery.data || [];
    const wallet = wallets.find(w => 
      w.coin_id === coinId && 
      (network ? w.network === network : true)
    );
    return wallet?.wallet_address;
  };

  return {
    userWallets: walletsQuery.data || [],
    isLoading: walletsQuery.isLoading,
    findWalletByAddress,
    getWalletAddress,
  };
};
