import { motion } from "framer-motion";
import { Eye, EyeOff, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";

const WalletBalance = () => {
  const [showBalance, setShowBalance] = useState(true);
  
  // Mock data - in real app this would come from an API
  const balance = 12458.32;
  const change = 2.45;
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/80 to-highlight p-6"
    >
      {/* Background decoration */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-highlight/20 blur-2xl" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-1">
          <span className="text-primary-foreground/70 text-sm font-medium">Total Balance</span>
          <button 
            onClick={() => setShowBalance(!showBalance)}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            {showBalance ? (
              <Eye className="w-4 h-4 text-primary-foreground" />
            ) : (
              <EyeOff className="w-4 h-4 text-primary-foreground" />
            )}
          </button>
        </div>
        
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-4xl font-bold text-primary-foreground">
            {showBalance ? `$${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "••••••"}
          </span>
          <span className="text-primary-foreground/70 text-lg">USD</span>
        </div>
        
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
          isPositive ? "bg-highlight/20 text-highlight" : "bg-destructive/20 text-destructive"
        }`}>
          {isPositive ? (
            <TrendingUp className="w-3.5 h-3.5" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5" />
          )}
          <span>{isPositive ? "+" : ""}{change}%</span>
          <span className="text-primary-foreground/50 ml-1">24h</span>
        </div>
      </div>
    </motion.div>
  );
};

export default WalletBalance;
