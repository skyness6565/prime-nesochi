import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency: number;
  sparkline_in_7d: {
    price: number[];
  };
  market_cap: number;
  total_volume: number;
}

// Extended list of popular cryptocurrencies
const COIN_IDS = [
  "bitcoin", 
  "ethereum", 
  "solana", 
  "binancecoin", 
  "tether", 
  "ripple", 
  "cardano", 
  "dogecoin",
  "polkadot",
  "avalanche-2",
  "chainlink",
  "polygon",
  "uniswap",
  "litecoin",
  "cosmos"
];

export const useCryptoPrices = () => {
  return useQuery({
    queryKey: ["crypto-prices"],
    queryFn: async (): Promise<CryptoPrice[]> => {
      const { data, error } = await supabase.functions.invoke("coingecko", {
        body: { coinIds: COIN_IDS },
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });
};
