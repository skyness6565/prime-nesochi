import { AlertCircle, Fuel, Info } from "lucide-react";
import { motion } from "framer-motion";

interface NetworkFeeWarningProps {
  networkName: string;
  networkCoinSymbol: string;
  networkCoinBalance: number;
  requiredFee: number;
  networkCoinPrice: number;
}

const NetworkFeeWarning = ({
  networkName,
  networkCoinSymbol,
  networkCoinBalance,
  requiredFee,
  networkCoinPrice,
}: NetworkFeeWarningProps) => {
  const requiredAmount = requiredFee / networkCoinPrice;
  const hasEnoughForFee = networkCoinBalance * networkCoinPrice >= requiredFee;
  const feeUsdValue = requiredFee;

  if (hasEnoughForFee) {
    return (
      <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-xl text-sm">
        <Fuel className="w-4 h-4 text-muted-foreground" />
        <span className="text-muted-foreground">
          Network fee: ~${feeUsdValue.toFixed(2)} ({requiredAmount.toFixed(6)} {networkCoinSymbol})
        </span>
        <span className="text-success ml-auto flex items-center gap-1">
          <Info className="w-3 h-3" />
          Sufficient
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-destructive font-semibold">
            Insufficient {networkCoinSymbol} for network fee
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            You need at least <span className="font-medium text-foreground">${requiredFee.toFixed(2)}</span> worth of{" "}
            <span className="font-medium text-foreground">{networkCoinSymbol}</span> to cover the{" "}
            {networkName} network fee.
          </p>
          <div className="mt-3 p-2 bg-background/50 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Required:</span>
              <span className="text-foreground font-medium">
                ~{requiredAmount.toFixed(6)} {networkCoinSymbol} (${requiredFee.toFixed(2)})
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">Your balance:</span>
              <span className={networkCoinBalance > 0 ? "text-foreground" : "text-destructive"}>
                {networkCoinBalance.toFixed(6)} {networkCoinSymbol} ($
                {(networkCoinBalance * networkCoinPrice).toFixed(2)})
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1 pt-1 border-t border-border">
              <span className="text-muted-foreground">Shortfall:</span>
              <span className="text-destructive font-medium">
                ${(requiredFee - networkCoinBalance * networkCoinPrice).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NetworkFeeWarning;
