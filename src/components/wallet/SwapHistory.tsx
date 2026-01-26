import { motion } from "framer-motion";
import { ArrowRightLeft, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { formatDistanceToNow } from "date-fns";

const SwapHistory = () => {
  const { transactions } = useWallet();

  // Filter swap transactions (where to_address or from_address is "swap")
  const swapTransactions = transactions.filter(
    (tx) => tx.to_address === "swap" || tx.from_address === "swap"
  );

  // Group send/receive pairs
  const groupedSwaps: Array<{
    id: string;
    fromSymbol: string;
    toSymbol: string;
    fromAmount: number;
    toAmount: number;
    status: string;
    timestamp: string;
  }> = [];

  const sendSwaps = swapTransactions.filter((tx) => tx.type === "send" && tx.to_address === "swap");
  
  sendSwaps.forEach((sendTx) => {
    const receiveTx = swapTransactions.find(
      (tx) =>
        tx.type === "receive" &&
        tx.from_address === "swap" &&
        Math.abs(new Date(tx.created_at).getTime() - new Date(sendTx.created_at).getTime()) < 5000
    );

    if (receiveTx) {
      groupedSwaps.push({
        id: sendTx.id,
        fromSymbol: sendTx.symbol,
        toSymbol: receiveTx.symbol,
        fromAmount: sendTx.amount,
        toAmount: receiveTx.amount,
        status: sendTx.status,
        timestamp: sendTx.created_at,
      });
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "pending":
        return <Loader2 className="w-4 h-4 text-warning animate-spin" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-success";
      case "pending":
        return "text-warning";
      case "failed":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  if (groupedSwaps.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6 text-center">
        <ArrowRightLeft className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground text-sm">No swap history yet</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Recent Swaps
        </h3>
      </div>
      
      <div className="divide-y divide-border max-h-64 overflow-y-auto">
        {groupedSwaps.slice(0, 10).map((swap, index) => (
          <motion.div
            key={swap.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 hover:bg-secondary/30 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <ArrowRightLeft className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-foreground">
                    {swap.fromAmount.toFixed(4)} {swap.fromSymbol} → {swap.toAmount.toFixed(4)} {swap.toSymbol}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    {formatDistanceToNow(new Date(swap.timestamp), { addSuffix: true })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(swap.status)}
                <span className={`text-sm capitalize ${getStatusColor(swap.status)}`}>
                  {swap.status}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SwapHistory;
