import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { motion } from "framer-motion";

interface PriceImpactWarningProps {
  priceImpact: number;
  fromSymbol: string;
  toSymbol: string;
}

const PriceImpactWarning = ({ priceImpact, fromSymbol, toSymbol }: PriceImpactWarningProps) => {
  // Price impact thresholds
  const isLow = priceImpact < 1;
  const isMedium = priceImpact >= 1 && priceImpact < 3;
  const isHigh = priceImpact >= 3 && priceImpact < 5;
  const isVeryHigh = priceImpact >= 5;

  if (isLow) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Info className="w-4 h-4" />
        <span>Price impact: ~{priceImpact.toFixed(2)}%</span>
      </div>
    );
  }

  if (isMedium) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/20 rounded-xl"
      >
        <AlertCircle className="w-5 h-5 text-warning shrink-0" />
        <div className="text-sm">
          <span className="text-warning font-medium">Moderate price impact: {priceImpact.toFixed(2)}%</span>
          <p className="text-muted-foreground mt-0.5">
            Your swap may affect the exchange rate slightly.
          </p>
        </div>
      </motion.div>
    );
  }

  if (isHigh) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl"
      >
        <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
        <div className="text-sm">
          <span className="text-destructive font-medium">High price impact: {priceImpact.toFixed(2)}%</span>
          <p className="text-muted-foreground mt-0.5">
            This swap will significantly affect the {toSymbol} price. Consider reducing amount.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-destructive/20 border-2 border-destructive rounded-xl"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-destructive shrink-0 animate-pulse" />
        <div>
          <span className="text-destructive font-bold text-lg">
            ⚠️ Very High Price Impact: {priceImpact.toFixed(2)}%
          </span>
          <p className="text-destructive/80 text-sm mt-1">
            You may receive significantly less {toSymbol} than expected. 
            This swap could cause major price slippage.
          </p>
          <p className="text-destructive font-medium text-sm mt-2">
            Consider splitting your order into smaller amounts.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default PriceImpactWarning;
