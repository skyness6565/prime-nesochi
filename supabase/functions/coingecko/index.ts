import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Longer cache duration to avoid rate limits
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 180000; // 3 minutes cache
const STALE_CACHE_DURATION = 900000; // 15 minutes for fallback

// Fallback data when API is rate limited and no cache
const FALLBACK_COINS = [
  { id: "bitcoin", symbol: "btc", name: "Bitcoin", image: "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png", current_price: 97500, market_cap: 1920000000000, market_cap_rank: 1, price_change_percentage_24h: 1.5, price_change_percentage_7d_in_currency: 3.2, sparkline_in_7d: { price: Array(168).fill(97000).map((p, i) => p + Math.sin(i * 0.1) * 2000) } },
  { id: "ethereum", symbol: "eth", name: "Ethereum", image: "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png", current_price: 3450, market_cap: 415000000000, market_cap_rank: 2, price_change_percentage_24h: 2.1, price_change_percentage_7d_in_currency: 5.4, sparkline_in_7d: { price: Array(168).fill(3400).map((p, i) => p + Math.sin(i * 0.1) * 100) } },
  { id: "tether", symbol: "usdt", name: "Tether", image: "https://coin-images.coingecko.com/coins/images/325/large/Tether.png", current_price: 1.00, market_cap: 140000000000, market_cap_rank: 3, price_change_percentage_24h: 0.01, price_change_percentage_7d_in_currency: 0.02, sparkline_in_7d: { price: Array(168).fill(1.00) } },
  { id: "solana", symbol: "sol", name: "Solana", image: "https://coin-images.coingecko.com/coins/images/4128/large/solana.png", current_price: 195, market_cap: 95000000000, market_cap_rank: 4, price_change_percentage_24h: 3.5, price_change_percentage_7d_in_currency: 8.2, sparkline_in_7d: { price: Array(168).fill(190).map((p, i) => p + Math.sin(i * 0.1) * 10) } },
  { id: "binancecoin", symbol: "bnb", name: "BNB", image: "https://coin-images.coingecko.com/coins/images/825/large/bnb-icon2_2x.png", current_price: 685, market_cap: 99000000000, market_cap_rank: 5, price_change_percentage_24h: 1.2, price_change_percentage_7d_in_currency: 2.8, sparkline_in_7d: { price: Array(168).fill(680).map((p, i) => p + Math.sin(i * 0.1) * 20) } },
  { id: "ripple", symbol: "xrp", name: "XRP", image: "https://coin-images.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png", current_price: 2.45, market_cap: 140000000000, market_cap_rank: 6, price_change_percentage_24h: 4.2, price_change_percentage_7d_in_currency: 12.5, sparkline_in_7d: { price: Array(168).fill(2.30).map((p, i) => p + Math.sin(i * 0.1) * 0.2) } },
  { id: "cardano", symbol: "ada", name: "Cardano", image: "https://coin-images.coingecko.com/coins/images/975/large/cardano.png", current_price: 1.05, market_cap: 37000000000, market_cap_rank: 7, price_change_percentage_24h: 2.8, price_change_percentage_7d_in_currency: 6.3, sparkline_in_7d: { price: Array(168).fill(1.00).map((p, i) => p + Math.sin(i * 0.1) * 0.05) } },
  { id: "dogecoin", symbol: "doge", name: "Dogecoin", image: "https://coin-images.coingecko.com/coins/images/5/large/dogecoin.png", current_price: 0.38, market_cap: 56000000000, market_cap_rank: 8, price_change_percentage_24h: 5.1, price_change_percentage_7d_in_currency: 15.2, sparkline_in_7d: { price: Array(168).fill(0.35).map((p, i) => p + Math.sin(i * 0.1) * 0.03) } },
  { id: "polkadot", symbol: "dot", name: "Polkadot", image: "https://coin-images.coingecko.com/coins/images/12171/large/polkadot.png", current_price: 7.85, market_cap: 12000000000, market_cap_rank: 9, price_change_percentage_24h: 1.9, price_change_percentage_7d_in_currency: 4.5, sparkline_in_7d: { price: Array(168).fill(7.50).map((p, i) => p + Math.sin(i * 0.1) * 0.3) } },
  { id: "avalanche-2", symbol: "avax", name: "Avalanche", image: "https://coin-images.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png", current_price: 42.50, market_cap: 17500000000, market_cap_rank: 10, price_change_percentage_24h: 2.3, price_change_percentage_7d_in_currency: 7.8, sparkline_in_7d: { price: Array(168).fill(41).map((p, i) => p + Math.sin(i * 0.1) * 2) } },
  { id: "chainlink", symbol: "link", name: "Chainlink", image: "https://coin-images.coingecko.com/coins/images/877/large/chainlink-new-logo.png", current_price: 24.50, market_cap: 15500000000, market_cap_rank: 11, price_change_percentage_24h: 3.2, price_change_percentage_7d_in_currency: 9.1, sparkline_in_7d: { price: Array(168).fill(23).map((p, i) => p + Math.sin(i * 0.1) * 1.5) } },
  { id: "polygon", symbol: "matic", name: "Polygon", image: "https://coin-images.coingecko.com/coins/images/4713/large/polygon.png", current_price: 0.52, market_cap: 4800000000, market_cap_rank: 12, price_change_percentage_24h: 1.8, price_change_percentage_7d_in_currency: 5.2, sparkline_in_7d: { price: Array(168).fill(0.50).map((p, i) => p + Math.sin(i * 0.1) * 0.02) } },
  { id: "uniswap", symbol: "uni", name: "Uniswap", image: "https://coin-images.coingecko.com/coins/images/12504/large/uniswap.png", current_price: 14.20, market_cap: 10700000000, market_cap_rank: 13, price_change_percentage_24h: 2.5, price_change_percentage_7d_in_currency: 6.8, sparkline_in_7d: { price: Array(168).fill(13.50).map((p, i) => p + Math.sin(i * 0.1) * 0.7) } },
  { id: "litecoin", symbol: "ltc", name: "Litecoin", image: "https://coin-images.coingecko.com/coins/images/2/large/litecoin.png", current_price: 115, market_cap: 8600000000, market_cap_rank: 14, price_change_percentage_24h: 1.4, price_change_percentage_7d_in_currency: 3.9, sparkline_in_7d: { price: Array(168).fill(112).map((p, i) => p + Math.sin(i * 0.1) * 5) } },
  { id: "cosmos", symbol: "atom", name: "Cosmos", image: "https://coin-images.coingecko.com/coins/images/1481/large/cosmos_hub.png", current_price: 9.25, market_cap: 3600000000, market_cap_rank: 15, price_change_percentage_24h: 2.1, price_change_percentage_7d_in_currency: 5.5, sparkline_in_7d: { price: Array(168).fill(8.80).map((p, i) => p + Math.sin(i * 0.1) * 0.4) } },
];

// Track last successful fetch time to throttle requests
let lastFetchTime = 0;
const MIN_FETCH_INTERVAL = 5000; // 5 seconds between requests

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

    // Throttle requests to avoid rate limiting
    const now = Date.now();
    if (now - lastFetchTime < MIN_FETCH_INTERVAL) {
      console.log("Throttling request, using cache or fallback");
      if (cached) {
        return new Response(JSON.stringify(cached.data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Return fallback data for main coins list
      if (!action || action === "markets_paginated") {
        console.log("Using fallback data due to throttling");
        return new Response(JSON.stringify(FALLBACK_COINS), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    console.log(`Fetching from CoinGecko: ${url}`);
    lastFetchTime = now;
    
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
      },
    });

    // If rate limited, return stale cache or fallback
    if (response.status === 429) {
      console.log("Rate limited by CoinGecko");
      if (cached && Date.now() - cached.timestamp < STALE_CACHE_DURATION) {
        console.log(`Returning stale cache for ${cacheKey}`);
        return new Response(JSON.stringify(cached.data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Return fallback data instead of error
      if (!action || action === "markets_paginated") {
        console.log("Using fallback data due to rate limit");
        return new Response(JSON.stringify(FALLBACK_COINS), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("Rate limited - please try again in a moment");
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`CoinGecko API error: ${response.status} - ${errorText}`);
      
      // Return stale cache or fallback if available
      if (cached) {
        console.log(`API error, returning stale cache for ${cacheKey}`);
        return new Response(JSON.stringify(cached.data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      // Return fallback for main coins
      if (!action || action === "markets_paginated") {
        console.log("Using fallback data due to API error");
        return new Response(JSON.stringify(FALLBACK_COINS), {
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
    
    // Return fallback data for main requests instead of error
    try {
      const body = await req.clone().json();
      if (!body.action || body.action === "markets_paginated") {
        console.log("Using fallback data due to exception");
        return new Response(JSON.stringify(FALLBACK_COINS), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } catch {
      // If we can't parse the body, still try to return fallback
      return new Response(JSON.stringify(FALLBACK_COINS), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
