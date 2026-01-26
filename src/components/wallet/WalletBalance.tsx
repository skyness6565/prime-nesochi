import { motion } from "framer-motion";
import { Eye, EyeOff, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useSettings } from "@/contexts/SettingsContext";
import { Skeleton } from "@/components/ui/skeleton";

const WalletBalance = () => {
  const [isHidden, setIsHidden] = useState(false);
  const { wallets, isLoading: walletsLoading } = useWallet();
  const { data: prices, isLoading: pricesLoading } = useCryptoPrices();
  const { t, formatAmount, currency } = useSettings();

  const isLoading = walletsLoading || pricesLoading;

  // Calculate total balance in USD
  const totalBalance = wallets.reduce((total, wallet) => {
    const price = prices?.find((p) => p.id === wallet.coin_id);
    if (price) {
      return total + wallet.balance * price.current_price;
    }
    return total;
  }, 0);

  // Calculate 24h change (weighted average of holdings)
  const totalChange = wallets.reduce((acc, wallet) => {
    const price = prices?.find((p) => p.id === wallet.coin_id);
    if (price) {
      const holdingValue = wallet.balance * price.current_price;
      return acc + (price.price_change_percentage_24h * holdingValue);
    }
    return acc;
  }, 0);

  const percentChange = totalBalance > 0 ? totalChange / totalBalance : 0;
  const isPositive = percentChange >= 0;

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/80 to-accent p-6"
      >
        <div className="relative z-10">
          <Skeleton className="h-4 w-24 mb-2 bg-white/20" />
          <Skeleton className="h-12 w-48 mb-4 bg-white/20" />
          <Skeleton className="h-6 w-32 bg-white/20" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/80 to-accent p-6"
    >
      {/* Background decoration */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-accent/20 blur-2xl" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-1">
          <span className="text-primary-foreground/70 text-sm font-medium">{t("totalBalance")}</span>
          <button 
            onClick={() => setIsHidden(!isHidden)}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            {isHidden ? (
              <EyeOff className="w-4 h-4 text-primary-foreground" />
            ) : (
              <Eye className="w-4 h-4 text-primary-foreground" />
            )}
          </button>
        </div>

        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-4xl font-bold text-primary-foreground">
            {isHidden ? "••••••" : formatAmount(totalBalance)}
          </span>
          <span className="text-primary-foreground/70 text-lg">{currency}</span>
        </div>

        {totalBalance > 0 ? (
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
            isPositive ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
          }`}>
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>{isPositive ? "+" : ""}{percentChange.toFixed(2)}%</span>
            <span className="text-primary-foreground/50 ml-1">{t("24hChange")}</span>
          </div>
        ) : (
          <p className="text-primary-foreground/70 text-sm">
            {t("startByReceiving")}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default WalletBalance;
