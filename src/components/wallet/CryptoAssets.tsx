import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface CryptoAsset {
  symbol: string;
  name: string;
  balance: number;
  usdValue: number;
  change24h: number;
  icon: string;
  color: string;
}

const assets: CryptoAsset[] = [
  { symbol: "BTC", name: "Bitcoin", balance: 0.0234, usdValue: 1102.34, change24h: 2.45, icon: "₿", color: "bg-orange-500" },
  { symbol: "ETH", name: "Ethereum", balance: 1.234, usdValue: 3045.67, change24h: -1.23, icon: "Ξ", color: "bg-blue-500" },
  { symbol: "USDT", name: "Tether", balance: 5420.50, usdValue: 5420.50, change24h: 0.01, icon: "$", color: "bg-green-500" },
  { symbol: "SOL", name: "Solana", balance: 12.5, usdValue: 1875.00, change24h: 5.67, icon: "◎", color: "bg-purple-500" },
  { symbol: "BNB", name: "BNB", balance: 3.2, usdValue: 1014.81, change24h: -0.45, icon: "B", color: "bg-yellow-500" },
];

const CryptoAssets = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-card rounded-2xl border border-border overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Your Assets</h3>
        <button className="text-sm text-primary hover:underline">Manage</button>
      </div>

      <div className="divide-y divide-border">
        {assets.map((asset, index) => (
          <motion.div
            key={asset.symbol}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3 p-4 hover:bg-secondary/30 transition-colors cursor-pointer"
          >
            <div className={`w-10 h-10 rounded-full ${asset.color} flex items-center justify-center text-white font-bold`}>
              {asset.icon}
            </div>
            
            <div className="flex-1">
              <div className="font-medium text-foreground">{asset.name}</div>
              <div className="text-sm text-muted-foreground">{asset.symbol}</div>
            </div>

            <div className="text-right">
              <div className="font-medium text-foreground">
                {asset.balance} {asset.symbol}
              </div>
              <div className="flex items-center justify-end gap-1">
                <span className="text-sm text-muted-foreground">
                  ${asset.usdValue.toLocaleString()}
                </span>
                <span className={`text-xs flex items-center gap-0.5 ${
                  asset.change24h >= 0 ? "text-highlight" : "text-destructive"
                }`}>
                  {asset.change24h >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(asset.change24h)}%
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default CryptoAssets;
