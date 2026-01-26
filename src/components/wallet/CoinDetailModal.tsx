import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, TrendingDown, Clock, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMarketChart, useCoinDetail } from "@/hooks/useMarketData";
import { Skeleton } from "@/components/ui/skeleton";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { format } from "date-fns";

interface CoinDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coinId: string;
  coinName: string;
  coinImage: string;
  coinSymbol: string;
}

const timeRanges = [
  { label: "1D", days: 1 },
  { label: "7D", days: 7 },
  { label: "1M", days: 30 },
  { label: "6M", days: 180 },
  { label: "1Y", days: 365 },
];

const CoinDetailModal = ({ open, onOpenChange, coinId, coinName, coinImage, coinSymbol }: CoinDetailModalProps) => {
  const [selectedRange, setSelectedRange] = useState(7);
  const { data: chartData, isLoading: chartLoading } = useMarketChart(coinId, selectedRange);
  const { data: coinDetail, isLoading: detailLoading } = useCoinDetail(coinId);

  const formattedChartData = chartData?.prices?.map(([timestamp, price]) => ({
    time: timestamp,
    price,
    formattedTime: format(new Date(timestamp), selectedRange <= 1 ? "HH:mm" : "MMM dd"),
  })) || [];

  const priceChange = coinDetail?.market_data?.price_change_percentage_24h || 0;
  const isPositive = priceChange >= 0;
  const currentPrice = coinDetail?.market_data?.current_price?.usd || 0;

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 bg-background overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border p-4">
            <div className="flex items-center justify-between max-w-lg mx-auto">
              <div className="flex items-center gap-3">
                <img src={coinImage} alt={coinName} className="w-10 h-10 rounded-full" />
                <div>
                  <h2 className="text-xl font-bold text-foreground">{coinName}</h2>
                  <span className="text-muted-foreground">{coinSymbol.toUpperCase()}</span>
                </div>
              </div>
              <button 
                onClick={() => onOpenChange(false)}
                className="p-2 rounded-full hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="max-w-lg mx-auto p-4 space-y-6">
            {/* Price Section */}
            <div className="text-center">
              {detailLoading ? (
                <Skeleton className="h-12 w-48 mx-auto mb-2" />
              ) : (
                <>
                  <motion.div 
                    key={currentPrice}
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-4xl font-bold text-foreground"
                  >
                    ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                  </motion.div>
                  <div className={`inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                    isPositive ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                  }`}>
                    {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {isPositive ? "+" : ""}{priceChange.toFixed(2)}% (24h)
                  </div>
                </>
              )}
            </div>

            {/* Time Range Selector */}
            <div className="flex justify-center gap-2">
              {timeRanges.map((range) => (
                <button
                  key={range.days}
                  onClick={() => setSelectedRange(range.days)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedRange === range.days
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {/* Chart */}
            <div className="bg-card rounded-2xl border border-border p-4">
              {chartLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={formattedChartData}>
                      <defs>
                        <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="formattedTime" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        domain={['dataMin', 'dataMax']}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                        width={80}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '12px',
                          padding: '12px',
                        }}
                        formatter={(value: number) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`, 'Price']}
                        labelFormatter={(label) => label}
                      />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                        fill="url(#priceGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Market Stats */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Market Stats
              </h3>
              
              {detailLoading ? (
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Market Cap</span>
                    <span className="text-foreground font-medium">
                      ${(coinDetail?.market_data?.market_cap?.usd || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">24h Volume</span>
                    <span className="text-foreground font-medium">
                      ${(coinDetail?.market_data?.total_volume?.usd || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">24h High</span>
                    <span className="text-success font-medium">
                      ${(coinDetail?.market_data?.high_24h?.usd || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">24h Low</span>
                    <span className="text-destructive font-medium">
                      ${(coinDetail?.market_data?.low_24h?.usd || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Circulating Supply</span>
                    <span className="text-foreground font-medium">
                      {(coinDetail?.market_data?.circulating_supply || 0).toLocaleString()} {coinSymbol.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">All-Time High</span>
                    <span className="text-foreground font-medium">
                      ${(coinDetail?.market_data?.ath?.usd || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Price Changes */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Price Changes
              </h3>
              
              {detailLoading ? (
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "24h", value: coinDetail?.market_data?.price_change_percentage_24h },
                    { label: "7d", value: coinDetail?.market_data?.price_change_percentage_7d },
                    { label: "30d", value: coinDetail?.market_data?.price_change_percentage_30d },
                    { label: "1y", value: coinDetail?.market_data?.price_change_percentage_1y },
                  ].map((item) => {
                    const val = item.value || 0;
                    const positive = val >= 0;
                    return (
                      <div 
                        key={item.label}
                        className={`p-3 rounded-xl ${positive ? "bg-success/10" : "bg-destructive/10"}`}
                      >
                        <div className="text-sm text-muted-foreground">{item.label}</div>
                        <div className={`text-lg font-bold ${positive ? "text-success" : "text-destructive"}`}>
                          {positive ? "+" : ""}{val.toFixed(2)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pb-8" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CoinDetailModal;
