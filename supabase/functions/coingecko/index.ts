import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory cache
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { coinIds, action, coinId, days, page, perPage } = await req.json();
    
    let url: string;
    let cacheKey: string;

    if (action === "market_chart" && coinId) {
      // Get historical chart data for a specific coin
      cacheKey = `chart_${coinId}_${days}`;
      url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days || 7}`;
    } else if (action === "coin_detail" && coinId) {
      // Get detailed info for a specific coin
      cacheKey = `detail_${coinId}`;
      url = `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`;
    } else if (action === "markets_paginated") {
      // Get paginated markets list
      const currentPage = page || 1;
      const itemsPerPage = perPage || 20;
      cacheKey = `markets_${currentPage}_${itemsPerPage}`;
      url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${itemsPerPage}&page=${currentPage}&sparkline=true&price_change_percentage=24h,7d`;
    } else {
      // Default: get specific coin IDs or top coins
      const ids = coinIds?.join(",") || "bitcoin,ethereum,tether,solana,binancecoin,ripple,cardano,dogecoin,polkadot,avalanche-2,chainlink,polygon,uniswap,litecoin,cosmos";
      cacheKey = `coins_${ids}`;
      url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=true&price_change_percentage=24h,7d`;
    }

    // Check cache
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`Cache hit for ${cacheKey}`);
      return new Response(JSON.stringify(cached.data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Fetching from CoinGecko: ${url}`);
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`CoinGecko API error: ${response.status} - ${errorText}`);
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Store in cache
    cache.set(cacheKey, { data, timestamp: Date.now() });

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching crypto data:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
