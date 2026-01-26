import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, ArrowDownUp, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useWallet } from "@/hooks/useWallet";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import BottomNavigation from "@/components/wallet/BottomNavigation";

const SwapPage = () => {
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
      priceChange: price.price_change_percentage_24h,
    };
  }).filter((c) => c.balance > 0) || [];

  const allCryptos = prices?.map((price) => ({
    id: price.id,
    symbol: price.symbol.toUpperCase(),
    name: price.name,
    image: price.image,
    currentPrice: price.current_price,
    priceChange: price.price_change_percentage_24h,
  })) || [];

  // Calculate swap rate and output
  const swapRate = fromCrypto && toCrypto 
    ? fromCrypto.currentPrice / toCrypto.currentPrice 
    : 0;
  const toAmount = fromAmount ? (parseFloat(fromAmount) * swapRate).toFixed(8) : "0";
  const fromUsdValue = fromCrypto ? parseFloat(fromAmount || "0") * fromCrypto.currentPrice : 0;

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
      description: `Swapped ${fromAmount} ${fromCrypto.symbol} for ${parseFloat(toAmount).toFixed(6)} ${toCrypto.symbol}`,
    });

    // Reset form
    setStep("select");
    setFromCrypto(null);
    setToCrypto(null);
    setFromAmount("");
  };

  const resetForm = () => {
    setStep("select");
    setFromCrypto(null);
    setToCrypto(null);
    setFromAmount("");
    setSelectingFor(null);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Swap</h1>
              <p className="text-sm text-muted-foreground">Exchange your crypto</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <AnimatePresence mode="wait">
          {selectingFor ? (
            <motion.div
              key="select-token"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setSelectingFor(null)}
                  className="text-primary font-medium"
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
                    <motion.button
                      key={crypto.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => {
                        if (selectingFor === "from" && "balance" in crypto) {
                          setFromCrypto(crypto as typeof fromCrypto);
                        } else if (selectingFor === "to") {
                          setToCrypto(crypto);
                        }
                        setSelectingFor(null);
                      }}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 transition-all bg-card"
                    >
                      <img src={crypto.image} alt={crypto.name} className="w-10 h-10 rounded-full" />
                      <div className="flex-1 text-left">
                        <div className="font-medium text-foreground">{crypto.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          {crypto.symbol}
                          {"priceChange" in crypto && (
                            <span className={`flex items-center text-xs ${(crypto.priceChange as number) >= 0 ? "text-success" : "text-destructive"}`}>
                              {(crypto.priceChange as number) >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                              {Math.abs(crypto.priceChange as number).toFixed(2)}%
                            </span>
                          )}
                        </div>
                      </div>
                      {"balance" in crypto && (
                        <div className="text-right">
                          <div className="font-medium text-foreground">{(crypto.balance as number).toFixed(6)}</div>
                          <div className="text-sm text-muted-foreground">{crypto.symbol}</div>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          ) : step === "select" ? (
            <motion.div
              key="swap-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {/* From Section */}
              <div className="bg-card rounded-2xl p-4 border border-border">
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
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    {fromCrypto ? (
                      <>
                        <img src={fromCrypto.image} alt={fromCrypto.name} className="w-6 h-6 rounded-full" />
                        <span className="font-medium text-foreground">{fromCrypto.symbol}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Select token</span>
                    )}
                    <span className="text-muted-foreground">▼</span>
                  </button>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    className="flex-1 text-xl font-bold bg-transparent border-0 text-right focus-visible:ring-0"
                    disabled={!fromCrypto}
                  />
                </div>
                {fromCrypto && (
                  <div className="flex justify-between mt-3">
                    <div className="flex gap-2">
                      {[25, 50, 75, 100].map((pct) => (
                        <button
                          key={pct}
                          onClick={() => setFromAmount((fromCrypto.balance * pct / 100).toFixed(6))}
                          className="px-3 py-1.5 text-xs rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors font-medium"
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
              <div className="flex justify-center -my-2 relative z-10">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSwapDirection}
                  disabled={!fromCrypto || !toCrypto}
                  className="p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:bg-secondary"
                >
                  <ArrowDownUp className="w-5 h-5" />
                </motion.button>
              </div>

              {/* To Section */}
              <div className="bg-card rounded-2xl p-4 border border-border">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-muted-foreground">To</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => fromCrypto && setSelectingFor("to")}
                    disabled={!fromCrypto}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-50"
                  >
                    {toCrypto ? (
                      <>
                        <img src={toCrypto.image} alt={toCrypto.name} className="w-6 h-6 rounded-full" />
                        <span className="font-medium text-foreground">{toCrypto.symbol}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Select token</span>
                    )}
                    <span className="text-muted-foreground">▼</span>
                  </button>
                  <div className="flex-1 text-xl font-bold text-right text-foreground py-3">
                    {toCrypto ? parseFloat(toAmount).toFixed(6) : "0.00"}
                  </div>
                </div>
                {toCrypto && (
                  <div className="text-right mt-3">
                    <span className="text-sm text-muted-foreground">
                      ≈ ${(parseFloat(toAmount) * toCrypto.currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>

              {/* Swap Rate */}
              {fromCrypto && toCrypto && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-secondary/50 rounded-xl p-4 text-center"
                >
                  <span className="text-sm text-muted-foreground">
                    1 {fromCrypto.symbol} = {swapRate.toFixed(6)} {toCrypto.symbol}
                  </span>
                </motion.div>
              )}

              <Button
                onClick={() => setStep("confirm")}
                disabled={!fromCrypto || !toCrypto || !fromAmount || parseFloat(fromAmount) > (fromCrypto?.balance || 0)}
                className="w-full h-14 text-lg font-semibold"
                size="lg"
              >
                Review Swap
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={fromCrypto?.image} alt="" className="w-12 h-12 rounded-full" />
                    <div>
                      <div className="font-semibold text-lg text-foreground">{fromAmount} {fromCrypto?.symbol}</div>
                      <div className="text-sm text-muted-foreground">
                        ≈ ${fromUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="p-2 rounded-full bg-secondary">
                    <ArrowDownUp className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={toCrypto?.image} alt="" className="w-12 h-12 rounded-full" />
                    <div>
                      <div className="font-semibold text-lg text-foreground">{parseFloat(toAmount).toFixed(6)} {toCrypto?.symbol}</div>
                      <div className="text-sm text-muted-foreground">
                        ≈ ${(parseFloat(toAmount) * (toCrypto?.currentPrice || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rate</span>
                  <span className="text-foreground font-medium">1 {fromCrypto?.symbol} = {swapRate.toFixed(6)} {toCrypto?.symbol}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Network Fee</span>
                  <span className="text-foreground font-medium">~$1.50</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Slippage Tolerance</span>
                  <span className="text-foreground font-medium">0.5%</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-primary/10 rounded-xl border border-primary/20">
                <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-primary">
                  Rates may change. Your swap will execute at the best available rate.
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("select")} className="flex-1 h-12">
                  Back
                </Button>
                <Button 
                  onClick={handleConfirmSwap} 
                  disabled={isSending}
                  className="flex-1 h-12"
                >
                  {isSending ? "Swapping..." : "Confirm Swap"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Info */}
        {step === "select" && !selectingFor && cryptosWithBalance.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">No tokens to swap</h3>
            <p className="text-sm text-muted-foreground">
              You need to have some crypto in your wallet to swap
            </p>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default SwapPage;
