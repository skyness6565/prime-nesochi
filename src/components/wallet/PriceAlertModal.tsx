import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, TrendingUp, TrendingDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { usePriceAlerts } from "@/hooks/usePriceAlerts";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

interface PriceAlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PriceAlertModal = ({ open, onOpenChange }: PriceAlertModalProps) => {
  const { data: prices, isLoading: pricesLoading } = useCryptoPrices();
  const { alerts, createAlert, deleteAlert, toggleAlert, isCreating, isLoading: alertsLoading } = usePriceAlerts();
  
  const [step, setStep] = useState<"list" | "create">("list");
  const [selectedCrypto, setSelectedCrypto] = useState<{
    id: string;
    symbol: string;
    name: string;
    image: string;
    currentPrice: number;
  } | null>(null);
  const [targetPrice, setTargetPrice] = useState("");
  const [condition, setCondition] = useState<"above" | "below">("above");

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep("list");
      setSelectedCrypto(null);
      setTargetPrice("");
      setCondition("above");
    }, 300);
  };

  const handleCreateAlert = () => {
    if (!selectedCrypto || !targetPrice) return;
    
    createAlert({
      coinId: selectedCrypto.id,
      symbol: selectedCrypto.symbol,
      targetPrice: parseFloat(targetPrice),
      condition,
    });
    
    handleClose();
  };

  const getCryptoImage = (coinId: string) => {
    return prices?.find(p => p.id === coinId)?.image || "";
  };

  const getCryptoPrice = (coinId: string) => {
    return prices?.find(p => p.id === coinId)?.current_price || 0;
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
                <Bell className="w-5 h-5 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Price Alerts</h2>
            </div>
            <button 
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {step === "list" ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <Button 
                onClick={() => setStep("create")} 
                className="w-full bg-primary"
              >
                + Create New Alert
              </Button>

              {alertsLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                  ))}
                </div>
              ) : alerts.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No price alerts yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create an alert to get notified when prices change
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {alerts.map((alert) => {
                    const currentPrice = getCryptoPrice(alert.coin_id);
                    const percentDiff = ((currentPrice - alert.target_price) / alert.target_price) * 100;
                    
                    return (
                      <div
                        key={alert.id}
                        className="flex items-center gap-3 p-4 rounded-xl border border-border bg-secondary/30"
                      >
                        <img 
                          src={getCryptoImage(alert.coin_id)} 
                          alt={alert.symbol} 
                          className="w-10 h-10 rounded-full" 
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{alert.symbol}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              alert.condition === "above" 
                                ? "bg-success/20 text-success" 
                                : "bg-destructive/20 text-destructive"
                            }`}>
                              {alert.condition === "above" ? "↑" : "↓"} {alert.condition}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Target: ${alert.target_price.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Current: ${currentPrice.toLocaleString()} ({percentDiff >= 0 ? "+" : ""}{percentDiff.toFixed(2)}%)
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={alert.is_active}
                            onCheckedChange={(checked) => toggleAlert({ alertId: alert.id, isActive: checked })}
                          />
                          <button
                            onClick={() => deleteAlert(alert.id)}
                            className="p-2 rounded-full hover:bg-destructive/20 text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <button 
                onClick={() => setStep("list")}
                className="text-primary text-sm"
              >
                ← Back to alerts
              </button>

              <p className="text-muted-foreground text-sm">Select cryptocurrency</p>
              
              {pricesLoading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {prices?.slice(0, 8).map((crypto) => (
                    <button
                      key={crypto.id}
                      onClick={() => {
                        setSelectedCrypto({
                          id: crypto.id,
                          symbol: crypto.symbol.toUpperCase(),
                          name: crypto.name,
                          image: crypto.image,
                          currentPrice: crypto.current_price,
                        });
                        setTargetPrice(crypto.current_price.toString());
                      }}
                      className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                        selectedCrypto?.id === crypto.id 
                          ? "border-primary bg-primary/10" 
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <img src={crypto.image} alt={crypto.name} className="w-8 h-8 rounded-full" />
                      <div className="text-left">
                        <div className="font-medium text-foreground text-sm">{crypto.symbol.toUpperCase()}</div>
                        <div className="text-xs text-muted-foreground">
                          ${crypto.current_price.toLocaleString()}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedCrypto && (
                <>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Alert when price goes</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCondition("above")}
                        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                          condition === "above" 
                            ? "border-success bg-success/10 text-success" 
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        <TrendingUp className="w-4 h-4" />
                        Above
                      </button>
                      <button
                        onClick={() => setCondition("below")}
                        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                          condition === "below" 
                            ? "border-destructive bg-destructive/10 text-destructive" 
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        <TrendingDown className="w-4 h-4" />
                        Below
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Target Price (USD)</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      className="h-12 text-xl font-bold bg-secondary border-border"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Current: ${selectedCrypto.currentPrice.toLocaleString()}
                    </p>
                  </div>

                  <Button
                    onClick={handleCreateAlert}
                    disabled={isCreating || !targetPrice}
                    className="w-full bg-primary h-12"
                  >
                    {isCreating ? "Creating..." : "Create Alert"}
                  </Button>
                </>
              )}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PriceAlertModal;
