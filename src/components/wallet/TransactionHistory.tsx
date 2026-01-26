import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, RefreshCw } from "lucide-react";
import { useWallet, Transaction } from "@/hooks/useWallet";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import TransactionDetailModal from "./TransactionDetailModal";

const TransactionHistory = () => {
  const { transactions, isLoading: txLoading } = useWallet();
  const { data: prices } = useCryptoPrices();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleTransactionClick = (tx: Transaction) => {
    setSelectedTransaction(tx);
    setShowDetailModal(true);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "send":
        return <ArrowUpRight className="w-4 h-4" />;
      case "receive":
        return <ArrowDownLeft className="w-4 h-4" />;
      case "swap":
        return <RefreshCw className="w-4 h-4" />;
      default:
        return <ArrowUpRight className="w-4 h-4" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case "send":
        return "bg-primary/20 text-primary";
      case "receive":
        return "bg-success/20 text-success";
      case "swap":
        return "bg-secondary text-foreground";
      default:
        return "bg-secondary text-muted-foreground";
    }
  };

  const getCoinImage = (coinId: string) => {
    const price = prices?.find((p) => p.id === coinId);
    return price?.image || "";
  };

  const getCoinPrice = (coinId: string) => {
    const price = prices?.find((p) => p.id === coinId);
    return price?.current_price || 0;
  };

  if (txLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Transaction History</h3>
        </div>
        <div className="divide-y divide-border">
          {[...Array(3)].map((_, i) => (
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
      </motion.div>
    );
  }

  if (transactions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Transaction History</h3>
        </div>
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No transactions yet</p>
          <p className="text-sm text-muted-foreground mt-1">Your transaction history will appear here</p>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl border border-border overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Transaction History</h3>
          <span className="text-sm text-muted-foreground">Tap to view details</span>
        </div>

        <div className="divide-y divide-border">
          {transactions.slice(0, 10).map((tx, index) => {
            const coinImage = getCoinImage(tx.coin_id);
            const coinPrice = getCoinPrice(tx.coin_id);
            const usdValue = tx.amount * coinPrice;
            
            return (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleTransactionClick(tx)}
                className="flex items-center gap-3 p-4 hover:bg-secondary/30 transition-colors cursor-pointer active:bg-secondary/50"
              >
                <div className="relative">
                  {coinImage ? (
                    <img src={coinImage} alt={tx.symbol} className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getIconBg(tx.type)}`}>
                      {getTransactionIcon(tx.type)}
                    </div>
                  )}
                  {coinImage && (
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${getIconBg(tx.type)}`}>
                      {getTransactionIcon(tx.type)}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground capitalize">
                      {tx.type === "swap" ? "Swap" : tx.type}
                    </span>
                    <span className={`text-xs capitalize ${
                      tx.status === "completed" ? "text-success" : 
                      tx.status === "pending" ? "text-yellow-500" : "text-destructive"
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(tx.created_at), "MMM d, h:mm a")}
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-medium ${tx.type === "receive" ? "text-success" : "text-foreground"}`}>
                    {tx.type === "receive" ? "+" : "-"}{tx.amount.toFixed(6)} {tx.symbol}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <TransactionDetailModal
        open={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
      />
    </>
  );
};

export default TransactionHistory;
