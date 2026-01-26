import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, RefreshCw } from "lucide-react";

interface Transaction {
  id: string;
  type: "send" | "receive" | "swap";
  crypto: string;
  amount: number;
  usdValue: number;
  address: string;
  status: "completed" | "pending" | "failed";
  timestamp: string;
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "receive",
    crypto: "BTC",
    amount: 0.0052,
    usdValue: 245.32,
    address: "bc1qxy...f1wlh",
    status: "completed",
    timestamp: "Today, 2:45 PM"
  },
  {
    id: "2",
    type: "send",
    crypto: "ETH",
    amount: 0.5,
    usdValue: 1234.50,
    address: "0x742d...AbcD",
    status: "completed",
    timestamp: "Today, 11:30 AM"
  },
  {
    id: "3",
    type: "swap",
    crypto: "USDT → ETH",
    amount: 500,
    usdValue: 500,
    address: "Internal",
    status: "pending",
    timestamp: "Yesterday, 8:15 PM"
  },
  {
    id: "4",
    type: "receive",
    crypto: "USDT",
    amount: 1500,
    usdValue: 1500,
    address: "0x8f2e...9c4B",
    status: "completed",
    timestamp: "Yesterday, 3:20 PM"
  },
  {
    id: "5",
    type: "send",
    crypto: "BTC",
    amount: 0.0125,
    usdValue: 589.75,
    address: "bc1qz9...m7np",
    status: "completed",
    timestamp: "Jan 24, 2026"
  },
];

const TransactionHistory = () => {
  const getIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "send":
        return <ArrowUpRight className="w-4 h-4" />;
      case "receive":
        return <ArrowDownLeft className="w-4 h-4" />;
      case "swap":
        return <RefreshCw className="w-4 h-4" />;
    }
  };

  const getIconBg = (type: Transaction["type"]) => {
    switch (type) {
      case "send":
        return "bg-primary/20 text-primary";
      case "receive":
        return "bg-highlight/20 text-highlight";
      case "swap":
        return "bg-secondary text-foreground";
    }
  };

  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "completed":
        return "text-highlight";
      case "pending":
        return "text-yellow-500";
      case "failed":
        return "text-destructive";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card rounded-2xl border border-border overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Transaction History</h3>
        <button className="text-sm text-primary hover:underline">View All</button>
      </div>

      <div className="divide-y divide-border">
        {mockTransactions.map((tx, index) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3 p-4 hover:bg-secondary/30 transition-colors cursor-pointer"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getIconBg(tx.type)}`}>
              {getIcon(tx.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground capitalize">
                  {tx.type === "swap" ? "Swap" : tx.type}
                </span>
                <span className={`text-xs ${getStatusColor(tx.status)} capitalize`}>
                  {tx.status}
                </span>
              </div>
              <div className="text-sm text-muted-foreground truncate">
                {tx.address}
              </div>
            </div>

            <div className="text-right">
              <div className={`font-medium ${tx.type === "receive" ? "text-highlight" : "text-foreground"}`}>
                {tx.type === "receive" ? "+" : tx.type === "send" ? "-" : ""}
                {tx.amount} {tx.crypto}
              </div>
              <div className="text-sm text-muted-foreground">
                ${tx.usdValue.toLocaleString()}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default TransactionHistory;
