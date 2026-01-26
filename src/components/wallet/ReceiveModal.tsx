import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowDownLeft, Copy, Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface ReceiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const cryptos = [
  { symbol: "BTC", name: "Bitcoin", address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", icon: "₿", color: "bg-orange-500" },
  { symbol: "ETH", name: "Ethereum", address: "0x742d35Cc6634C0532925a3b844Bc9e7595f1AbcD", icon: "Ξ", color: "bg-blue-500" },
  { symbol: "USDT", name: "Tether (ERC-20)", address: "0x742d35Cc6634C0532925a3b844Bc9e7595f1AbcD", icon: "$", color: "bg-green-500" },
];

const ReceiveModal = ({ open, onOpenChange }: ReceiveModalProps) => {
  const [selectedCrypto, setSelectedCrypto] = useState(cryptos[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(selectedCrypto.address);
    setCopied(true);
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `My ${selectedCrypto.name} Address`,
        text: selectedCrypto.address,
      });
    } else {
      handleCopy();
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
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
              <div className="w-10 h-10 rounded-full bg-highlight flex items-center justify-center">
                <ArrowDownLeft className="w-5 h-5 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Receive Crypto</h2>
            </div>
            <button 
              onClick={() => onOpenChange(false)}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">Select cryptocurrency to receive</p>
            
            <div className="flex gap-2 overflow-x-auto pb-2">
              {cryptos.map((crypto) => (
                <button
                  key={crypto.symbol}
                  onClick={() => setSelectedCrypto(crypto)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap ${
                    selectedCrypto.symbol === crypto.symbol 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full ${crypto.color} flex items-center justify-center text-white font-bold text-xs`}>
                    {crypto.icon}
                  </div>
                  <span className="font-medium text-foreground">{crypto.symbol}</span>
                </button>
              ))}
            </div>

            {/* QR Code placeholder */}
            <div className="flex flex-col items-center py-6">
              <div className="w-48 h-48 bg-white rounded-2xl p-4 mb-4">
                <div className="w-full h-full bg-secondary rounded-lg flex items-center justify-center">
                  <div className="grid grid-cols-5 gap-1">
                    {[...Array(25)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-6 h-6 rounded-sm ${Math.random() > 0.5 ? 'bg-foreground' : 'bg-white'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Scan to receive {selectedCrypto.name}</p>
            </div>

            {/* Address */}
            <div className="bg-secondary/50 rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-2">Your {selectedCrypto.symbol} Address</p>
              <p className="font-mono text-sm text-foreground break-all">
                {selectedCrypto.address}
              </p>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleCopy}
                className="flex-1"
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
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReceiveModal;
