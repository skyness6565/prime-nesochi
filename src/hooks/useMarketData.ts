import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CryptoPrice } from "./useCryptoPrices";

interface MarketChartData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

interface CoinDetail {
  id: string;
  symbol: string;
  name: string;
  image: {
    large: string;
    small: string;
    thumb: string;
  };
  market_data: {
    current_price: { usd: number };
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_30d: number;
    price_change_percentage_1y: number;
    market_cap: { usd: number };
    total_volume: { usd: number };
    high_24h: { usd: number };
    low_24h: { usd: number };
    circulating_supply: number;
    total_supply: number;
    ath: { usd: number };
    atl: { usd: number };
  };
  description: {
    en: string;
  };
}

export const useMarketChart = (coinId: string, days: number = 7) => {
  return useQuery({
    queryKey: ["market-chart", coinId, days],
    queryFn: async (): Promise<MarketChartData> => {
      const { data, error } = await supabase.functions.invoke("coingecko", {
        body: { action: "market_chart", coinId, days },
      });

      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!coinId,
    staleTime: 120000, // 2 minutes
    refetchInterval: 120000, // 2 minutes
    retry: 2,
    retryDelay: 3000,
  });
};

export const useCoinDetail = (coinId: string) => {
  return useQuery({
    queryKey: ["coin-detail", coinId],
    queryFn: async (): Promise<CoinDetail> => {
      const { data, error } = await supabase.functions.invoke("coingecko", {
        body: { action: "coin_detail", coinId },
      });

      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!coinId,
    staleTime: 120000, // 2 minutes
    retry: 2,
    retryDelay: 3000,
  });
};

export const usePaginatedMarkets = (page: number = 1, perPage: number = 20) => {
  return useQuery({
    queryKey: ["paginated-markets", page, perPage],
    queryFn: async (): Promise<CryptoPrice[]> => {
      const { data, error } = await supabase.functions.invoke("coingecko", {
        body: { action: "markets_paginated", page, perPage },
      });

      if (error) throw new Error(error.message);
      return data;
    },
    staleTime: 120000, // 2 minutes
    refetchInterval: 120000, // 2 minutes
    retry: 2,
    retryDelay: 3000,
  });
};
