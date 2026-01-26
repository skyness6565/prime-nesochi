import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUpRight, Wallet, AlertCircle, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useWallet } from "@/hooks/useWallet";
import { useUserWallets, CRYPTO_NETWORKS } from "@/hooks/useUserWallets";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface SendModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SendModal = ({ open, onOpenChange }: SendModalProps) => {
  const { data: prices, isLoading: pricesLoading } = useCryptoPrices();
  const { wallets, sendCrypto, isSending } = useWallet();
  const { findWalletByAddress } = useUserWallets();
  
  const [step, setStep] = useState<"select" | "amount" | "confirm">("select");
  const [selectedCrypto, setSelectedCrypto] = useState<{
    id: string;
    symbol: string;
    name: string;
    balance: number;
    image: string;
    currentPrice: number;
  } | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");
  const [showNetworkSelect, setShowNetworkSelect] = useState(false);
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [recipientInfo, setRecipientInfo] = useState<{ exists: boolean; userId?: string } | null>(null);

  // Combine prices with wallet balances
  const cryptosWithBalance = prices?.map((price) => {
    const wallet = wallets.find((w) => w.coin_id === price.id);
    return {
      id: price.id,
      symbol: price.symbol.toUpperCase(),
      name: price.name,
      balance: wallet?.balance || 0,
      image: price.image,
      currentPrice: price.current_price,
    };
  }).filter((c) => c.balance > 0) || [];

  const filteredCryptos = cryptosWithBalance.filter((crypto) =>
    crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const networks = selectedCrypto ? CRYPTO_NETWORKS[selectedCrypto.id] || [{ name: "Default Network", prefix: "" }] : [];

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep("select");
      setSelectedCrypto(null);
      setSelectedNetwork("");
      setAddress("");
      setAmount("");
      setSearchQuery("");
      setRecipientInfo(null);
    }, 300);
  };

  const validateAddress = async (addr: string) => {
    if (!addr || addr.length < 10) {
      setRecipientInfo(null);
      return;
    }
    
    setIsValidatingAddress(true);
    try {
      const wallet = await findWalletByAddress(addr);
      if (wallet) {
        setRecipientInfo({ exists: true, userId: wallet.user_id });
      } else {
        setRecipientInfo({ exists: false });
      }
    } catch (error) {
      setRecipientInfo(null);
    }
    setIsValidatingAddress(false);
  };

  const handleSend = async () => {
    if (!selectedCrypto) return;
    
    // If recipient is a platform user, credit their wallet
    if (recipientInfo?.exists && recipientInfo.userId) {
      // Get recipient's wallet
      const { data: recipientWallet } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", recipientInfo.userId)
        .eq("coin_id", selectedCrypto.id)
        .maybeSingle();

      const currentBalance = recipientWallet ? parseFloat(String(recipientWallet.balance)) : 0;
      const newBalance = currentBalance + parseFloat(amount);

      if (recipientWallet) {
        await supabase
          .from("wallets")
          .update({ balance: newBalance })
          .eq("id", recipientWallet.id);
      } else {
        // Get coin name from prices
        const coinData = prices?.find(p => p.id === selectedCrypto.id);
        await supabase
          .from("wallets")
          .insert({
            user_id: recipientInfo.userId,
            coin_id: selectedCrypto.id,
            symbol: selectedCrypto.symbol,
            name: coinData?.name || selectedCrypto.name,
            balance: parseFloat(amount),
          });
      }

      // Create receive transaction for recipient
      await supabase
        .from("transactions")
        .insert({
          user_id: recipientInfo.userId,
          type: "receive",
          coin_id: selectedCrypto.id,
          symbol: selectedCrypto.symbol,
          amount: parseFloat(amount),
          from_address: address,
          status: "completed",
          tx_hash: `0x${Math.random().toString(16).slice(2)}`,
        });
    }
    
    sendCrypto({
      coinId: selectedCrypto.id,
      symbol: selectedCrypto.symbol,
      amount: parseFloat(amount),
      toAddress: address,
    });
    
    toast({
      title: "Transaction Sent",
      description: recipientInfo?.exists 
        ? "Funds transferred to platform user successfully!"
        : "Transaction submitted to the network.",
    });
    
    handleClose();
  };

  if (!open) return null;

  const usdValue = selectedCrypto ? parseFloat(amount || "0") * selectedCrypto.currentPrice : 0;

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
          className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl border-t border-border p-6 max-h-[90vh] overflow-y-auto"
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
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search crypto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-secondary border-border"
                />
              </div>
              
              {pricesLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredCryptos.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No assets to send. Receive some crypto first!</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                  {filteredCryptos.map((crypto) => (
                    <button
                      key={crypto.id}
                      onClick={() => {
                        setSelectedCrypto(crypto);
                        setSelectedNetwork(CRYPTO_NETWORKS[crypto.id]?.[0]?.name || "");
                        setStep("amount");
                      }}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 transition-all"
                    >
                      <img src={crypto.image} alt={crypto.name} className="w-10 h-10 rounded-full" />
                      <div className="flex-1 text-left">
                        <div className="font-medium text-foreground">{crypto.name}</div>
                        <div className="text-sm text-muted-foreground">{crypto.symbol}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-foreground">{crypto.balance.toFixed(6)}</div>
                        <div className="text-sm text-muted-foreground">{crypto.symbol}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {step === "amount" && selectedCrypto && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                <img src={selectedCrypto.image} alt={selectedCrypto.name} className="w-8 h-8 rounded-full" />
                <span className="font-medium text-foreground">{selectedCrypto.name}</span>
              </div>

              {/* Network Selection */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Network</label>
                <div className="relative">
                  <button
                    onClick={() => setShowNetworkSelect(!showNetworkSelect)}
                    className="w-full flex items-center justify-between p-3 bg-secondary rounded-xl border border-border hover:border-primary/50 transition-colors"
                  >
                    <span className="text-foreground">{selectedNetwork || "Select network"}</span>
                    <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${showNetworkSelect ? "rotate-180" : ""}`} />
                  </button>
                  
                  {showNetworkSelect && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-10 overflow-hidden"
                    >
                      {networks.map((network) => (
                        <button
                          key={network.name}
                          onClick={() => {
                            setSelectedNetwork(network.name);
                            setShowNetworkSelect(false);
                          }}
                          className={`w-full p-3 text-left hover:bg-secondary transition-colors ${
                            selectedNetwork === network.name ? "bg-primary/10 text-primary" : "text-foreground"
                          }`}
                        >
                          {network.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Recipient Address</label>
                <div className="relative">
                  <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Enter wallet address"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      validateAddress(e.target.value);
                    }}
                    className="pl-10 h-12 bg-secondary border-border"
                  />
                </div>
                {isValidatingAddress && (
                  <p className="text-sm text-muted-foreground mt-1">Validating address...</p>
                )}
                {recipientInfo?.exists && (
                  <p className="text-sm text-success mt-1">✓ Platform user found - instant transfer</p>
                )}
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
                <div className="flex justify-between mt-1">
                  <p className="text-sm text-muted-foreground">
                    ≈ ${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Available: {selectedCrypto.balance.toFixed(6)} {selectedCrypto.symbol}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setAmount((selectedCrypto.balance * pct / 100).toFixed(6))}
                    className="flex-1 py-2 text-sm font-medium rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
                  >
                    {pct}%
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep("select")} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={() => setStep("confirm")} 
                  disabled={!address || !amount || parseFloat(amount) > selectedCrypto.balance || !selectedNetwork}
                  className="flex-1 bg-primary"
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {step === "confirm" && selectedCrypto && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <img src={selectedCrypto.image} alt={selectedCrypto.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <div className="font-medium text-foreground">{selectedCrypto.name}</div>
                    <div className="text-sm text-muted-foreground">{selectedNetwork}</div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sending</span>
                  <span className="font-bold text-foreground">{amount} {selectedCrypto.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Value</span>
                  <span className="text-foreground">${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">To</span>
                  <span className="font-mono text-foreground text-sm">{address.slice(0, 12)}...{address.slice(-6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network Fee</span>
                  <span className="text-foreground">~$2.50</span>
                </div>
                {recipientInfo?.exists && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transfer Type</span>
                    <span className="text-success">Platform Transfer (Instant)</span>
                  </div>
                )}
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
                <Button onClick={handleSend} disabled={isSending} className="flex-1 bg-primary">
                  {isSending ? "Sending..." : "Confirm Send"}
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
