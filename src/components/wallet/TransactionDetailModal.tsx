import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Copy, Check, ArrowUpRight, ArrowDownLeft, RefreshCw, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Transaction } from "@/hooks/useWallet";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";

interface TransactionDetailModalProps {
  open: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

const TransactionDetailModal = ({ open, onClose, transaction }: TransactionDetailModalProps) => {
  const [copied, setCopied] = useState<string | null>(null);
  const { data: prices } = useCryptoPrices();

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(field);
    toast({
      title: "Copied",
      description: `${field} copied to clipboard`,
    });
    setTimeout(() => setCopied(null), 2000);
  };

  if (!transaction) return null;

  const coinData = prices?.find(p => p.id === transaction.coin_id);
  const usdValue = transaction.amount * (coinData?.current_price || 0);

  const getTypeIcon = () => {
    switch (transaction.type) {
      case "send":
        return <ArrowUpRight className="w-6 h-6 text-primary-foreground" />;
      case "receive":
        return <ArrowDownLeft className="w-6 h-6 text-primary-foreground" />;
      case "swap":
        return <RefreshCw className="w-6 h-6 text-primary-foreground" />;
    }
  };

  const getTypeColor = () => {
    switch (transaction.type) {
      case "send":
        return "bg-primary";
      case "receive":
        return "bg-success";
      case "swap":
        return "bg-secondary";
    }
  };

  const getStatusIcon = () => {
    switch (transaction.status) {
      case "completed":
        return <CheckCircle className="w-8 h-8 text-primary-foreground" />;
      case "pending":
        return <Clock className="w-8 h-8 text-primary-foreground" />;
      case "failed":
        return <XCircle className="w-8 h-8 text-primary-foreground" />;
    }
  };

  const getTypeLabel = () => {
    switch (transaction.type) {
      case "send":
        return "Sent";
      case "receive":
        return "Received";
      case "swap":
        return "Swapped";
    }
  };

  const getStatusColor = () => {
    switch (transaction.status) {
      case "completed":
        return "text-success";
      case "pending":
        return "text-yellow-500";
      case "failed":
        return "text-destructive";
    }
  };

  const getStatusBg = () => {
    switch (transaction.status) {
      case "completed":
        return "bg-success";
      case "pending":
        return "bg-yellow-500";
      case "failed":
        return "bg-destructive";
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-card rounded-2xl border border-border overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 p-6 pb-8">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary/50 transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              <div className="flex flex-col items-center text-center">
                {/* Status Icon */}
                <div className={`w-16 h-16 rounded-full ${getStatusBg()} flex items-center justify-center mb-4`}>
                  {getStatusIcon()}
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-foreground mb-1">
                  {getTypeLabel()} {transaction.symbol}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(transaction.created_at), "MMMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>

            {/* Amount */}
            <div className="px-6 py-4 border-b border-border text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                {coinData?.image && (
                  <img src={coinData.image} alt={coinData.name} className="w-8 h-8 rounded-full" />
                )}
                <span className={`text-3xl font-bold ${transaction.type === "receive" ? "text-success" : "text-foreground"}`}>
                  {transaction.type === "receive" ? "+" : "-"}{transaction.amount.toFixed(6)} {transaction.symbol}
                </span>
              </div>
              <p className="text-muted-foreground">
                ≈ ${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            {/* Details */}
            <div className="px-6 py-4 space-y-3">
              {/* Status */}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <span className={`font-medium capitalize ${getStatusColor()}`}>
                  {transaction.status}
                </span>
              </div>

              {/* Type */}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Type</span>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full ${getTypeColor()} flex items-center justify-center`}>
                    {getTypeIcon()}
                  </div>
                  <span className="text-foreground capitalize">{transaction.type}</span>
                </div>
              </div>

              {/* Asset */}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Asset</span>
                <span className="text-foreground">{coinData?.name || transaction.symbol} ({transaction.symbol})</span>
              </div>

              {/* To Address */}
              {transaction.to_address && (
                <div className="space-y-1">
                  <span className="text-muted-foreground text-sm">To Address</span>
                  <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-2">
                    <span className="font-mono text-xs text-foreground flex-1 break-all">
                      {transaction.to_address}
                    </span>
                    <button
                      onClick={() => handleCopy(transaction.to_address!, "Address")}
                      className="p-1.5 rounded-md hover:bg-secondary transition-colors shrink-0"
                    >
                      {copied === "Address" ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* From Address */}
              {transaction.from_address && (
                <div className="space-y-1">
                  <span className="text-muted-foreground text-sm">From Address</span>
                  <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-2">
                    <span className="font-mono text-xs text-foreground flex-1 break-all">
                      {transaction.from_address}
                    </span>
                    <button
                      onClick={() => handleCopy(transaction.from_address!, "From Address")}
                      className="p-1.5 rounded-md hover:bg-secondary transition-colors shrink-0"
                    >
                      {copied === "From Address" ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Transaction Hash */}
              {transaction.tx_hash && (
                <div className="space-y-1">
                  <span className="text-muted-foreground text-sm">Transaction ID</span>
                  <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-2">
                    <span className="font-mono text-xs text-foreground flex-1 truncate">
                      {transaction.tx_hash}
                    </span>
                    <button
                      onClick={() => handleCopy(transaction.tx_hash!, "Transaction ID")}
                      className="p-1.5 rounded-md hover:bg-secondary transition-colors shrink-0"
                    >
                      {copied === "Transaction ID" ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Date/Time */}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Date & Time</span>
                <span className="text-foreground text-sm">
                  {format(new Date(transaction.created_at), "MMM d, yyyy h:mm:ss a")}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 pt-2">
              <Button onClick={onClose} className="w-full bg-primary">
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TransactionDetailModal;
