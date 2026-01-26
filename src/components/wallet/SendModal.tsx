import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUpRight, Wallet, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface SendModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const cryptos = [
  { symbol: "BTC", name: "Bitcoin", balance: 0.0234, icon: "₿", color: "bg-orange-500" },
  { symbol: "ETH", name: "Ethereum", balance: 1.234, icon: "Ξ", color: "bg-blue-500" },
  { symbol: "USDT", name: "Tether", balance: 5420.50, icon: "$", color: "bg-green-500" },
];

const SendModal = ({ open, onOpenChange }: SendModalProps) => {
  const [step, setStep] = useState<"select" | "amount" | "confirm">("select");
  const [selectedCrypto, setSelectedCrypto] = useState(cryptos[0]);
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep("select");
      setAddress("");
      setAmount("");
    }, 300);
  };

  const handleSend = () => {
    toast({
      title: "Transaction Sent",
      description: `Sending ${amount} ${selectedCrypto.symbol} to ${address.slice(0, 8)}...`,
    });
    handleClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl border-t border-border p-6 max-h-[85vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Send Crypto</h2>
            </div>
            <button 
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {step === "select" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <p className="text-muted-foreground text-sm">Select cryptocurrency to send</p>
              <div className="space-y-2">
                {cryptos.map((crypto) => (
                  <button
                    key={crypto.symbol}
                    onClick={() => {
                      setSelectedCrypto(crypto);
                      setStep("amount");
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      selectedCrypto.symbol === crypto.symbol 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full ${crypto.color} flex items-center justify-center text-white font-bold`}>
                      {crypto.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-foreground">{crypto.name}</div>
                      <div className="text-sm text-muted-foreground">{crypto.symbol}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-foreground">{crypto.balance}</div>
                      <div className="text-sm text-muted-foreground">{crypto.symbol}</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === "amount" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                <div className={`w-8 h-8 rounded-full ${selectedCrypto.color} flex items-center justify-center text-white font-bold text-sm`}>
                  {selectedCrypto.icon}
                </div>
                <span className="font-medium text-foreground">{selectedCrypto.name}</span>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Recipient Address</label>
                <div className="relative">
                  <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Enter wallet address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="pl-10 h-12 bg-secondary border-border"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Amount</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-12 text-2xl font-bold bg-secondary border-border"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Available: {selectedCrypto.balance} {selectedCrypto.symbol}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep("select")} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={() => setStep("confirm")} 
                  disabled={!address || !amount}
                  className="flex-1 bg-primary"
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {step === "confirm" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sending</span>
                  <span className="font-bold text-foreground">{amount} {selectedCrypto.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">To</span>
                  <span className="font-mono text-foreground text-sm">{address.slice(0, 12)}...{address.slice(-6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network Fee</span>
                  <span className="text-foreground">~$2.50</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold text-foreground">{amount} {selectedCrypto.symbol}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-xl">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">
                  Please verify the recipient address. Transactions cannot be reversed.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep("amount")} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleSend} className="flex-1 bg-primary">
                  Confirm Send
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SendModal;
