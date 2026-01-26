import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Longer cache duration to avoid rate limits
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 120000; // 2 minutes cache
const STALE_CACHE_DURATION = 600000; // 10 minutes for fallback

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { coinIds, action, coinId, days, page, perPage } = await req.json();
    
    let url: string;
    let cacheKey: string;

    if (action === "market_chart" && coinId) {
      cacheKey = `chart_${coinId}_${days}`;
      url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days || 7}`;
    } else if (action === "coin_detail" && coinId) {
      cacheKey = `detail_${coinId}`;
      url = `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`;
    } else if (action === "markets_paginated") {
      const currentPage = page || 1;
      const itemsPerPage = perPage || 20;
      cacheKey = `markets_${currentPage}_${itemsPerPage}`;
      url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${itemsPerPage}&page=${currentPage}&sparkline=true&price_change_percentage=24h,7d`;
    } else {
      const ids = coinIds?.join(",") || "bitcoin,ethereum,tether,solana,binancecoin,ripple,cardano,dogecoin,polkadot,avalanche-2,chainlink,polygon,uniswap,litecoin,cosmos";
      cacheKey = `coins_${ids}`;
      url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=true&price_change_percentage=24h,7d`;
    }

    // Check cache - return if fresh
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`Cache hit for ${cacheKey}`);
      return new Response(JSON.stringify(cached.data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Fetching from CoinGecko: ${url}`);
    
    // Add delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
      },
    });

    // If rate limited, return stale cache if available
    if (response.status === 429) {
      console.log("Rate limited by CoinGecko");
      if (cached && Date.now() - cached.timestamp < STALE_CACHE_DURATION) {
        console.log(`Returning stale cache for ${cacheKey}`);
        return new Response(JSON.stringify(cached.data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("Rate limited - please try again in a moment");
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`CoinGecko API error: ${response.status} - ${errorText}`);
      
      // Return stale cache if available
      if (cached) {
        console.log(`API error, returning stale cache for ${cacheKey}`);
        return new Response(JSON.stringify(cached.data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
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
