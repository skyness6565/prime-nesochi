import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, TrendingUp, TrendingDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { Skeleton } from "@/components/ui/skeleton";

interface CryptoSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect?: (crypto: {
    id: string;
    symbol: string;
    name: string;
    image: string;
    currentPrice: number;
  }) => void;
}

const CryptoSearch = ({ open, onOpenChange, onSelect }: CryptoSearchProps) => {
  const { data: prices, isLoading } = useCryptoPrices();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCryptos = prices?.filter((crypto) =>
    crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleSelect = (crypto: typeof prices[0]) => {
    if (onSelect) {
      onSelect({
        id: crypto.id,
        symbol: crypto.symbol.toUpperCase(),
        name: crypto.name,
        image: crypto.image,
        currentPrice: crypto.current_price,
      });
    }
    onOpenChange(false);
    setSearchQuery("");
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl border-t border-border p-6 max-h-[90vh] overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Search Crypto</h2>
            <button 
              onClick={() => onOpenChange(false)}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by name or symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-secondary border-border"
              autoFocus
            />
          </div>

          <div className="overflow-y-auto flex-1 -mx-6 px-6">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-4">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : filteredCryptos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No cryptocurrencies found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try searching for a different name or symbol
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredCryptos.map((crypto) => (
                  <motion.button
                    key={crypto.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => handleSelect(crypto)}
                    className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-secondary/50 transition-colors"
                  >
                    <img
                      src={crypto.image}
                      alt={crypto.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1 text-left">
                      <div className="font-medium text-foreground">{crypto.name}</div>
                      <div className="text-sm text-muted-foreground">{crypto.symbol.toUpperCase()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-foreground">
                        ${crypto.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className={`text-xs flex items-center justify-end gap-0.5 ${
                        crypto.price_change_percentage_24h >= 0 ? "text-success" : "text-destructive"
                      }`}>
                        {crypto.price_change_percentage_24h >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CryptoSearch;
