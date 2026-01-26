import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, ArrowDownUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useWallet } from "@/hooks/useWallet";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

interface SwapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SwapModal = ({ open, onOpenChange }: SwapModalProps) => {
  const { data: prices, isLoading: pricesLoading } = useCryptoPrices();
  const { wallets, sendCrypto, receiveCrypto, isSending } = useWallet();
  
  const [fromCrypto, setFromCrypto] = useState<{
    id: string;
    symbol: string;
    name: string;
    balance: number;
    image: string;
    currentPrice: number;
  } | null>(null);
  
  const [toCrypto, setToCrypto] = useState<{
    id: string;
    symbol: string;
    name: string;
    image: string;
    currentPrice: number;
  } | null>(null);
  
  const [fromAmount, setFromAmount] = useState("");
  const [selectingFor, setSelectingFor] = useState<"from" | "to" | null>(null);
  const [step, setStep] = useState<"select" | "confirm">("select");

  // Combine prices with wallet balances for "from" options
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

  const allCryptos = prices?.map((price) => ({
    id: price.id,
    symbol: price.symbol.toUpperCase(),
    name: price.name,
    image: price.image,
    currentPrice: price.current_price,
  })) || [];

  // Calculate swap rate and output
  const swapRate = fromCrypto && toCrypto 
    ? fromCrypto.currentPrice / toCrypto.currentPrice 
    : 0;
  const toAmount = fromAmount ? (parseFloat(fromAmount) * swapRate).toFixed(8) : "0";
  const fromUsdValue = fromCrypto ? parseFloat(fromAmount || "0") * fromCrypto.currentPrice : 0;

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep("select");
      setFromCrypto(null);
      setToCrypto(null);
      setFromAmount("");
      setSelectingFor(null);
    }, 300);
  };

  const handleSwapDirection = () => {
    if (!fromCrypto || !toCrypto) return;
    
    const tempFrom = fromCrypto;
    const hasBalance = cryptosWithBalance.find(c => c.id === toCrypto.id);
    
    if (hasBalance) {
      setFromCrypto({
        ...toCrypto,
        balance: hasBalance.balance,
      });
      setToCrypto({
        id: tempFrom.id,
        symbol: tempFrom.symbol,
        name: tempFrom.name,
        image: tempFrom.image,
        currentPrice: tempFrom.currentPrice,
      });
      setFromAmount("");
    } else {
      toast({
        title: "Cannot swap",
        description: `You don't have any ${toCrypto.symbol} to swap`,
        variant: "destructive",
      });
    }
  };

  const handleConfirmSwap = async () => {
    if (!fromCrypto || !toCrypto || !fromAmount) return;

    // Deduct from source
    sendCrypto({
      coinId: fromCrypto.id,
      symbol: fromCrypto.symbol,
      amount: parseFloat(fromAmount),
      toAddress: "swap",
    });

    // Add to destination (simulated)
    setTimeout(() => {
      receiveCrypto({
        coinId: toCrypto.id,
        symbol: toCrypto.symbol,
        name: toCrypto.name,
        amount: parseFloat(toAmount),
        fromAddress: "swap",
      });
    }, 500);

    toast({
      title: "Swap Successful!",
      description: `Swapped ${fromAmount} ${fromCrypto.symbol} for ${toAmount} ${toCrypto.symbol}`,
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
          className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl border-t border-border p-6 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-foreground" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Swap Crypto</h2>
            </div>
            <button 
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {selectingFor ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setSelectingFor(null)}
                  className="text-primary"
                >
                  ← Back
                </button>
                <span className="text-muted-foreground">
                  Select {selectingFor === "from" ? "source" : "destination"} token
                </span>
              </div>
              
              {pricesLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {(selectingFor === "from" ? cryptosWithBalance : allCryptos)
                    .filter(c => selectingFor === "to" ? c.id !== fromCrypto?.id : true)
                    .map((crypto) => (
                    <button
                      key={crypto.id}
                      onClick={() => {
                        if (selectingFor === "from") {
                          setFromCrypto(crypto as typeof fromCrypto);
                        } else {
                          setToCrypto(crypto);
                        }
                        setSelectingFor(null);
                      }}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 transition-all"
                    >
                      <img src={crypto.image} alt={crypto.name} className="w-10 h-10 rounded-full" />
                      <div className="flex-1 text-left">
                        <div className="font-medium text-foreground">{crypto.name}</div>
                        <div className="text-sm text-muted-foreground">{crypto.symbol}</div>
                      </div>
                      {"balance" in crypto && (
                        <div className="text-right">
                          <div className="font-medium text-foreground">{(crypto.balance as number).toFixed(6)}</div>
                          <div className="text-sm text-muted-foreground">{crypto.symbol}</div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          ) : step === "select" ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {/* From Section */}
              <div className="bg-secondary/50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-muted-foreground">From</span>
                  {fromCrypto && (
                    <span className="text-sm text-muted-foreground">
                      Balance: {fromCrypto.balance.toFixed(6)} {fromCrypto.symbol}
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectingFor("from")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    {fromCrypto ? (
                      <>
                        <img src={fromCrypto.image} alt={fromCrypto.name} className="w-6 h-6 rounded-full" />
                        <span className="font-medium text-foreground">{fromCrypto.symbol}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Select</span>
                    )}
                    <span className="text-muted-foreground">▼</span>
                  </button>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    className="flex-1 text-xl font-bold bg-transparent border-0 text-right"
                    disabled={!fromCrypto}
                  />
                </div>
                {fromCrypto && (
                  <div className="flex justify-between mt-2">
                    <div className="flex gap-2">
                      {[25, 50, 75, 100].map((pct) => (
                        <button
                          key={pct}
                          onClick={() => setFromAmount((fromCrypto.balance * pct / 100).toFixed(6))}
                          className="px-2 py-1 text-xs rounded bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ≈ ${fromUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>

              {/* Swap Direction Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleSwapDirection}
                  disabled={!fromCrypto || !toCrypto}
                  className="p-3 rounded-full bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-50"
                >
                  <ArrowDownUp className="w-5 h-5 text-foreground" />
                </button>
              </div>

              {/* To Section */}
              <div className="bg-secondary/50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-muted-foreground">To</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => fromCrypto && setSelectingFor("to")}
                    disabled={!fromCrypto}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-50"
                  >
                    {toCrypto ? (
                      <>
                        <img src={toCrypto.image} alt={toCrypto.name} className="w-6 h-6 rounded-full" />
                        <span className="font-medium text-foreground">{toCrypto.symbol}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Select</span>
                    )}
                    <span className="text-muted-foreground">▼</span>
                  </button>
                  <div className="flex-1 text-xl font-bold text-right text-foreground">
                    {parseFloat(toAmount).toFixed(6)}
                  </div>
                </div>
                {toCrypto && (
                  <div className="text-right mt-2">
                    <span className="text-sm text-muted-foreground">
                      ≈ ${(parseFloat(toAmount) * toCrypto.currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>

              {/* Swap Rate */}
              {fromCrypto && toCrypto && (
                <div className="bg-secondary/30 rounded-xl p-3 text-center">
                  <span className="text-sm text-muted-foreground">
                    1 {fromCrypto.symbol} = {swapRate.toFixed(6)} {toCrypto.symbol}
                  </span>
                </div>
              )}

              <Button
                onClick={() => setStep("confirm")}
                disabled={!fromCrypto || !toCrypto || !fromAmount || parseFloat(fromAmount) > (fromCrypto?.balance || 0)}
                className="w-full bg-primary h-12 text-lg"
              >
                Review Swap
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="bg-secondary/50 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={fromCrypto?.image} alt="" className="w-10 h-10 rounded-full" />
                    <div>
                      <div className="font-medium text-foreground">{fromAmount} {fromCrypto?.symbol}</div>
                      <div className="text-sm text-muted-foreground">
                        ≈ ${fromUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <ArrowDownUp className="w-5 h-5 text-muted-foreground" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={toCrypto?.image} alt="" className="w-10 h-10 rounded-full" />
                    <div>
                      <div className="font-medium text-foreground">{parseFloat(toAmount).toFixed(6)} {toCrypto?.symbol}</div>
                      <div className="text-sm text-muted-foreground">
                        ≈ ${(parseFloat(toAmount) * (toCrypto?.currentPrice || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-secondary/30 rounded-xl p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rate</span>
                  <span className="text-foreground">1 {fromCrypto?.symbol} = {swapRate.toFixed(6)} {toCrypto?.symbol}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Network Fee</span>
                  <span className="text-foreground">~$1.50</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Slippage</span>
                  <span className="text-foreground">0.5%</span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-primary/10 rounded-xl">
                <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-primary">
                  Rates may change. Your swap will execute at the best available rate.
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("select")} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handleConfirmSwap} 
                  disabled={isSending}
                  className="flex-1 bg-primary"
                >
                  {isSending ? "Swapping..." : "Confirm Swap"}
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SwapModal;
