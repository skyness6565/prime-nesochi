import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, BarChart3, ArrowUpDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePaginatedMarkets } from "@/hooks/useMarketData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import BottomNavigation from "@/components/wallet/BottomNavigation";
import WalletHeader from "@/components/wallet/WalletHeader";
import CoinDetailModal from "@/components/wallet/CoinDetailModal";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

type SortField = "market_cap" | "price" | "change_24h" | "volume";
type SortDirection = "asc" | "desc";

const Markets = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("market_cap");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedCoin, setSelectedCoin] = useState<{
    id: string;
    name: string;
    image: string;
    symbol: string;
  } | null>(null);

  const { data: markets, isLoading, isFetching } = usePaginatedMarkets(page, 20);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return null;

  const filteredMarkets = markets?.filter((coin) =>
    coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const sortedMarkets = [...filteredMarkets].sort((a, b) => {
    let aVal: number, bVal: number;
    
    switch (sortField) {
      case "price":
        aVal = a.current_price;
        bVal = b.current_price;
        break;
      case "change_24h":
        aVal = a.price_change_percentage_24h;
        bVal = b.price_change_percentage_24h;
        break;
      case "volume":
        aVal = a.total_volume;
        bVal = b.total_volume;
        break;
      default:
        aVal = a.market_cap;
        bVal = b.market_cap;
    }
    
    return sortDirection === "desc" ? bVal - aVal : aVal - bVal;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className={`flex items-center gap-1 text-xs font-medium transition-colors ${
        sortField === field ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
      {sortField === field && (
        <ArrowUpDown className={`w-3 h-3 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <WalletHeader />
      
      <main className="container mx-auto px-4 py-4 space-y-4 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Markets</h1>
            <p className="text-sm text-muted-foreground">Live cryptocurrency prices</p>
          </div>
          {isFetching && !isLoading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              Updating...
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search cryptocurrencies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary border-border h-12"
          />
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-4 overflow-x-auto pb-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Sort by:</span>
          <SortButton field="market_cap" label="Market Cap" />
          <SortButton field="price" label="Price" />
          <SortButton field="change_24h" label="24h %" />
          <SortButton field="volume" label="Volume" />
        </div>

        {/* Market Table */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 p-3 border-b border-border bg-secondary/30">
            <div className="col-span-1 text-xs text-muted-foreground">#</div>
            <div className="col-span-4 text-xs text-muted-foreground">Name</div>
            <div className="col-span-2 text-xs text-muted-foreground text-right">Price</div>
            <div className="col-span-2 text-xs text-muted-foreground text-right">24h</div>
            <div className="col-span-2 text-xs text-muted-foreground text-right">Chart</div>
            <div className="col-span-1"></div>
          </div>

          {/* Table Body */}
          {isLoading ? (
            <div className="divide-y divide-border">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 p-3 items-center">
                  <Skeleton className="col-span-1 h-4 w-4" />
                  <div className="col-span-4 flex items-center gap-2">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-10" />
                    </div>
                  </div>
                  <Skeleton className="col-span-2 h-4" />
                  <Skeleton className="col-span-2 h-4" />
                  <Skeleton className="col-span-2 h-8" />
                  <Skeleton className="col-span-1 h-6 w-12" />
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {sortedMarkets.map((coin, index) => {
                const isPositive = coin.price_change_percentage_24h >= 0;
                const sparklineData = coin.sparkline_in_7d?.price?.slice(-24).map((price, i) => ({ value: price })) || [];
                
                return (
                  <motion.div
                    key={coin.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="grid grid-cols-12 gap-2 p-3 items-center hover:bg-secondary/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedCoin({
                      id: coin.id,
                      name: coin.name,
                      image: coin.image,
                      symbol: coin.symbol,
                    })}
                  >
                    <div className="col-span-1 text-xs text-muted-foreground">
                      {(page - 1) * 20 + index + 1}
                    </div>
                    
                    <div className="col-span-4 flex items-center gap-2">
                      <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                      <div className="min-w-0">
                        <div className="font-medium text-foreground text-sm truncate">{coin.name}</div>
                        <div className="text-xs text-muted-foreground">{coin.symbol.toUpperCase()}</div>
                      </div>
                    </div>
                    
                    <div className="col-span-2 text-right">
                      <div className="font-medium text-foreground text-sm">
                        ${coin.current_price < 1 
                          ? coin.current_price.toFixed(6) 
                          : coin.current_price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    
                    <div className="col-span-2 text-right">
                      <span className={`text-sm font-medium ${isPositive ? "text-success" : "text-destructive"}`}>
                        {isPositive ? "+" : ""}{coin.price_change_percentage_24h?.toFixed(2)}%
                      </span>
                    </div>
                    
                    <div className="col-span-2 h-8">
                      {sparklineData.length > 0 && (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={sparklineData}>
                            <defs>
                              <linearGradient id={`gradient-${coin.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"} stopOpacity={0.3} />
                                <stop offset="100%" stopColor={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"} stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <Area
                              type="monotone"
                              dataKey="value"
                              stroke={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                              fill={`url(#gradient-${coin.id})`}
                              strokeWidth={1.5}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                    
                    <div className="col-span-1 flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCoin({
                            id: coin.id,
                            name: coin.name,
                            image: coin.image,
                            symbol: coin.symbol,
                          });
                        }}
                      >
                        <BarChart3 className="w-3 h-3" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => {
              const pageNum = page - 2 + i;
              if (pageNum < 1) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    pageNum === page
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={isLoading || (markets?.length || 0) < 20}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </main>

      <BottomNavigation />

      {selectedCoin && (
        <CoinDetailModal
          open={!!selectedCoin}
          onOpenChange={() => setSelectedCoin(null)}
          coinId={selectedCoin.id}
          coinName={selectedCoin.name}
          coinImage={selectedCoin.image}
          coinSymbol={selectedCoin.symbol}
        />
      )}
    </div>
  );
};

export default Markets;
