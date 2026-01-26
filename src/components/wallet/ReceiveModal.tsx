import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowDownLeft, Copy, Check, Share2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useUserWallets, CRYPTO_NETWORKS } from "@/hooks/useUserWallets";
import { Skeleton } from "@/components/ui/skeleton";
import { QRCodeSVG } from "qrcode.react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";

interface ReceiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReceiveModal = ({ open, onOpenChange }: ReceiveModalProps) => {
  const { data: prices, isLoading } = useCryptoPrices();
  const { userWallets, getWalletAddress, isLoading: walletsLoading } = useUserWallets();
  
  const [selectedCrypto, setSelectedCrypto] = useState<{
    id: string;
    symbol: string;
    name: string;
    image: string;
  } | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");
  const [showNetworkSelect, setShowNetworkSelect] = useState(false);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<"select" | "details">("select");

  // Popular cryptos to show first
  const popularCryptos = ["bitcoin", "ethereum", "solana", "binancecoin"];
  
  const sortedPrices = useMemo(() => {
    if (!prices) return [];
    const popular = prices.filter(p => popularCryptos.includes(p.id));
    const others = prices.filter(p => !popularCryptos.includes(p.id));
    return [...popular, ...others];
  }, [prices]);

  const networks = selectedCrypto ? CRYPTO_NETWORKS[selectedCrypto.id] || [{ name: "Default Network", prefix: "" }] : [];
  
  const walletAddress = selectedCrypto 
    ? getWalletAddress(selectedCrypto.id, selectedNetwork) || userWallets.find(w => w.coin_id === selectedCrypto.id)?.wallet_address
    : "";

  const selectedPrice = selectedCrypto ? prices?.find(p => p.id === selectedCrypto.id) : null;
  const sparklineData = selectedPrice?.sparkline_in_7d?.price?.map((price, i) => ({ value: price })) || [];

  const handleCopy = async () => {
    if (!walletAddress) return;
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!walletAddress || !selectedCrypto) return;
    if (navigator.share) {
      await navigator.share({
        title: `My ${selectedCrypto.name} Address`,
        text: walletAddress,
      });
    } else {
      handleCopy();
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep("select");
      setSelectedCrypto(null);
      setSelectedNetwork("");
    }, 300);
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
              <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center">
                <ArrowDownLeft className="w-5 h-5 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Receive Crypto</h2>
            </div>
            <button 
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {step === "select" ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <p className="text-muted-foreground text-sm">Select cryptocurrency to receive</p>
              
              {isLoading || walletsLoading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {sortedPrices.map((crypto) => (
                    <button
                      key={crypto.id}
                      onClick={() => {
                        setSelectedCrypto({
                          id: crypto.id,
                          symbol: crypto.symbol.toUpperCase(),
                          name: crypto.name,
                          image: crypto.image,
                        });
                        setSelectedNetwork(CRYPTO_NETWORKS[crypto.id]?.[0]?.name || "");
                        setStep("details");
                      }}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 transition-all"
                    >
                      <img src={crypto.image} alt={crypto.name} className="w-10 h-10 rounded-full" />
                      <div className="flex-1 text-left">
                        <div className="font-medium text-foreground">{crypto.name}</div>
                        <div className="text-sm text-muted-foreground">{crypto.symbol.toUpperCase()}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-foreground">
                          ${crypto.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className={`text-sm ${crypto.price_change_percentage_24h >= 0 ? "text-success" : "text-destructive"}`}>
                          {crypto.price_change_percentage_24h >= 0 ? "+" : ""}{crypto.price_change_percentage_24h.toFixed(2)}%
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          ) : selectedCrypto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <button 
                onClick={() => setStep("select")}
                className="text-primary text-sm"
              >
                ← Back to selection
              </button>

              {/* Crypto Info Header */}
              <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                <img src={selectedCrypto.image} alt={selectedCrypto.name} className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <div className="font-medium text-foreground">{selectedCrypto.name}</div>
                  <div className="text-sm text-muted-foreground">{selectedCrypto.symbol}</div>
                </div>
                {selectedPrice && (
                  <div className="text-right">
                    <div className="font-medium text-foreground">
                      ${selectedPrice.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className={`text-sm ${selectedPrice.price_change_percentage_24h >= 0 ? "text-success" : "text-destructive"}`}>
                      {selectedPrice.price_change_percentage_24h >= 0 ? "+" : ""}{selectedPrice.price_change_percentage_24h.toFixed(2)}%
                    </div>
                  </div>
                )}
              </div>

              {/* Mini Chart */}
              {sparklineData.length > 0 && (
                <div className="h-24 w-full bg-secondary/30 rounded-xl p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparklineData}>
                      <defs>
                        <linearGradient id="receiveChartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <YAxis domain={['dataMin', 'dataMax']} hide />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        fill="url(#receiveChartGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

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

              {/* QR Code */}
              {walletAddress && (
                <div className="flex flex-col items-center py-4">
                  <div className="bg-white rounded-2xl p-4 mb-4">
                    <QRCodeSVG 
                      value={walletAddress} 
                      size={180}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">Scan to receive {selectedCrypto.name}</p>
                </div>
              )}

              {/* Address */}
              {walletAddress && (
                <div className="bg-secondary/50 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-2">Your {selectedCrypto.symbol} Address ({selectedNetwork})</p>
                  <p className="font-mono text-sm text-foreground break-all">
                    {walletAddress}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleCopy}
                  className="flex-1"
                  disabled={!walletAddress}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Address
                    </>
                  )}
                </Button>
                <Button 
                  onClick={handleShare}
                  className="flex-1 bg-primary"
                  disabled={!walletAddress}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>

              {/* Important Note */}
              <div className="border-t border-border pt-4 mt-4">
                <p className="text-sm text-muted-foreground text-center">
                  Only send {selectedCrypto.name} to this address on the selected network
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReceiveModal;
