import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { generateDefaultWalletAddresses, CRYPTO_ADDRESS_CONFIGS } from "@/lib/walletAddressGenerator";

export interface UserWallet {
  id: string;
  user_id: string;
  coin_id: string;
  symbol: string;
  network: string;
  wallet_address: string;
  created_at: string;
}

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
  polkadot: [
    { name: "Polkadot", prefix: "1" },
  ],
  "avalanche-2": [
    { name: "Avalanche C-Chain", prefix: "0x" },
  ],
  chainlink: [
    { name: "Ethereum", prefix: "0x" },
  ],
  polygon: [
    { name: "Polygon", prefix: "0x" },
  ],
  uniswap: [
    { name: "Ethereum", prefix: "0x" },
  ],
  litecoin: [
    { name: "Litecoin", prefix: "L" },
  ],
  cosmos: [
    { name: "Cosmos", prefix: "cosmos1" },
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
      
      // If no wallets exist, create default ones with random addresses
      if (!data || data.length === 0) {
        const defaultAddresses = generateDefaultWalletAddresses();
        const newWallets = defaultAddresses.map(w => ({
          user_id: user.id,
          coin_id: w.coinId,
          symbol: w.symbol,
          network: w.network,
          wallet_address: (w as any).wallet_address,
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

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ["user-wallets", user?.id] });
  };

  return {
    userWallets: walletsQuery.data || [],
    isLoading: walletsQuery.isLoading,
    findWalletByAddress,
    getWalletAddress,
    refetch,
  };
};
