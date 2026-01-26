import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Search } from "lucide-react";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useWallet } from "@/hooks/useWallet";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import CryptoSearch from "./CryptoSearch";

const CryptoAssets = () => {
  const { data: prices, isLoading: pricesLoading } = useCryptoPrices();
  const { wallets, isLoading: walletsLoading } = useWallet();
  const [searchOpen, setSearchOpen] = useState(false);

  const isLoading = pricesLoading || walletsLoading;

  // Popular cryptos to show first
  const popularCryptos = ["bitcoin", "ethereum", "solana", "binancecoin"];

  // Combine wallet balances with live prices
  const assets = useMemo(() => {
    if (!prices) return [];
    
    return prices.map((price) => {
      const wallet = wallets.find((w) => w.coin_id === price.id);
      const balance = wallet?.balance || 0;
      const usdValue = balance * price.current_price;

      return {
        id: price.id,
        symbol: price.symbol.toUpperCase(),
        name: price.name,
        balance,
        usdValue,
        change24h: price.price_change_percentage_24h,
        image: price.image,
        currentPrice: price.current_price,
        isPriority: popularCryptos.includes(price.id),
      };
    });
  }, [prices, wallets]);

  // Sort: owned assets first, then priority cryptos, then by market cap
  const displayAssets = useMemo(() => {
    const withBalance = assets.filter((a) => a.balance > 0);
    const priority = assets.filter((a) => a.balance === 0 && a.isPriority);
    const others = assets.filter((a) => a.balance === 0 && !a.isPriority);
    
    if (withBalance.length > 0) {
      return withBalance;
    }
    return [...priority, ...others].slice(0, 8);
  }, [assets]);

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Your Assets</h3>
        </div>
        <div className="divide-y divide-border">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hasAssets = assets.some((a) => a.balance > 0);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl border border-border overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">
            {hasAssets ? "Your Assets" : "Market Prices"}
          </h3>
          <button 
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>

        <div className="divide-y divide-border">
          {displayAssets.map((asset, index) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3 p-4 hover:bg-secondary/30 transition-colors cursor-pointer"
            >
              <img
                src={asset.image}
                alt={asset.name}
                className="w-10 h-10 rounded-full"
              />

              <div className="flex-1">
                <div className="font-medium text-foreground">{asset.name}</div>
                <div className="text-sm text-muted-foreground">
                  {hasAssets ? `${asset.balance.toFixed(6)} ${asset.symbol}` : asset.symbol}
                </div>
              </div>

              <div className="text-right">
                <div className="font-medium text-foreground">
                  {hasAssets
                    ? `$${asset.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : `$${asset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </div>
                <div className="flex items-center justify-end gap-1">
                  <span
                    className={`text-xs flex items-center gap-0.5 ${
                      asset.change24h >= 0 ? "text-success" : "text-destructive"
                    }`}
                  >
                    {asset.change24h >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {Math.abs(asset.change24h).toFixed(2)}%
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <CryptoSearch 
        open={searchOpen} 
        onOpenChange={setSearchOpen}
      />
    </>
  );
};

export default CryptoAssets;
