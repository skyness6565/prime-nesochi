import { motion } from "framer-motion";
import { X, CheckCircle, Copy, Check, ExternalLink, ArrowUpRight, ArrowDownLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface TransferReceiptProps {
  open: boolean;
  onClose: () => void;
  type: "send" | "receive" | "swap";
  coinId: string;
  coinSymbol: string;
  coinName: string;
  coinImage?: string;
  amount: number;
  usdValue: number;
  toAddress?: string;
  fromAddress?: string;
  txHash: string;
  network: string;
  status: "completed" | "pending" | "failed";
  timestamp: Date;
  isPlatformTransfer?: boolean;
  networkFee?: number;
  networkFeeSymbol?: string;
}

const TransferReceipt = ({
  open,
  onClose,
  type,
  coinSymbol,
  coinName,
  coinImage,
  amount,
  usdValue,
  toAddress,
  fromAddress,
  txHash,
  network,
  status,
  timestamp,
  isPlatformTransfer,
  networkFee,
  networkFeeSymbol,
}: TransferReceiptProps) => {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(field);
    toast({
      title: "Copied",
      description: `${field} copied to clipboard`,
    });
    setTimeout(() => setCopied(null), 2000);
  };

  const getTypeIcon = () => {
    switch (type) {
      case "send":
        return <ArrowUpRight className="w-6 h-6 text-primary-foreground" />;
      case "receive":
        return <ArrowDownLeft className="w-6 h-6 text-primary-foreground" />;
      case "swap":
        return <RefreshCw className="w-6 h-6 text-primary-foreground" />;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case "send":
        return "bg-primary";
      case "receive":
        return "bg-success";
      case "swap":
        return "bg-secondary";
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case "send":
        return "Sent";
      case "receive":
        return "Received";
      case "swap":
        return "Swapped";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "text-success";
      case "pending":
        return "text-yellow-500";
      case "failed":
        return "text-destructive";
    }
  };

  if (!open) return null;

  return (
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
        className="w-full max-w-md bg-card rounded-2xl border border-border overflow-hidden"
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
            <div className={`w-16 h-16 rounded-full ${getTypeColor()} flex items-center justify-center mb-4`}>
              {status === "completed" ? (
                <CheckCircle className="w-8 h-8 text-primary-foreground" />
              ) : (
                getTypeIcon()
              )}
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-foreground mb-1">
              {getTypeLabel()} Successfully
            </h2>
            <p className="text-sm text-muted-foreground">
              {format(timestamp, "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>

        {/* Amount */}
        <div className="px-6 py-4 border-b border-border text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            {coinImage && (
              <img src={coinImage} alt={coinName} className="w-8 h-8 rounded-full" />
            )}
            <span className={`text-3xl font-bold ${type === "receive" ? "text-success" : "text-foreground"}`}>
              {type === "receive" ? "+" : "-"}{amount.toFixed(6)} {coinSymbol}
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
              {status}
            </span>
          </div>

          {/* Type */}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Type</span>
            <span className="text-foreground capitalize">{type}</span>
          </div>

          {/* Asset */}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Asset</span>
            <span className="text-foreground">{coinName} ({coinSymbol})</span>
          </div>

          {/* Network */}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Network</span>
            <span className="text-foreground">{network}</span>
          </div>

          {/* Transfer Type */}
          {isPlatformTransfer && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Transfer Type</span>
              <span className="text-success">Platform (Instant)</span>
            </div>
          )}

          {/* Network Fee */}
          {networkFee !== undefined && networkFeeSymbol && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Network Fee</span>
              <span className="text-foreground">~${networkFee.toFixed(2)} ({networkFeeSymbol})</span>
            </div>
          )}

          {/* To Address */}
          {toAddress && (
            <div className="space-y-1">
              <span className="text-muted-foreground text-sm">To Address</span>
              <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-2">
                <span className="font-mono text-xs text-foreground flex-1 break-all">
                  {toAddress}
                </span>
                <button
                  onClick={() => handleCopy(toAddress, "Address")}
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
          {fromAddress && (
            <div className="space-y-1">
              <span className="text-muted-foreground text-sm">From Address</span>
              <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-2">
                <span className="font-mono text-xs text-foreground flex-1 break-all">
                  {fromAddress}
                </span>
                <button
                  onClick={() => handleCopy(fromAddress, "Address")}
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

          {/* Transaction Hash */}
          <div className="space-y-1">
            <span className="text-muted-foreground text-sm">Transaction ID</span>
            <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-2">
              <span className="font-mono text-xs text-foreground flex-1 truncate">
                {txHash}
              </span>
              <button
                onClick={() => handleCopy(txHash, "Transaction ID")}
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
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 pt-2 space-y-3">
          <Button onClick={onClose} className="w-full bg-primary">
            Done
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TransferReceipt;
