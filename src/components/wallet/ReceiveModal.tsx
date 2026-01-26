import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowDownLeft, Copy, Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useWallet } from "@/hooks/useWallet";
import { Skeleton } from "@/components/ui/skeleton";

interface ReceiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Generate a mock wallet address based on coin type
const generateWalletAddress = (coinId: string): string => {
  const prefix = coinId === "bitcoin" ? "bc1q" : 
                 coinId === "solana" ? "" :
                 "0x";
  const length = coinId === "bitcoin" ? 39 : 
                 coinId === "solana" ? 44 : 40;
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let address = prefix;
  for (let i = 0; i < length - prefix.length; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
};

const ReceiveModal = ({ open, onOpenChange }: ReceiveModalProps) => {
  const { data: prices, isLoading } = useCryptoPrices();
  const { receiveCrypto } = useWallet();
  
  const [selectedCrypto, setSelectedCrypto] = useState<{
    id: string;
    symbol: string;
    name: string;
    image: string;
    address: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [simulateAmount, setSimulateAmount] = useState("");

  // Initialize selected crypto when prices load
  if (prices && prices.length > 0 && !selectedCrypto) {
    const firstCrypto = prices[0];
    setSelectedCrypto({
      id: firstCrypto.id,
      symbol: firstCrypto.symbol.toUpperCase(),
      name: firstCrypto.name,
      image: firstCrypto.image,
      address: generateWalletAddress(firstCrypto.id),
    });
  }

  const cryptos = prices?.map((price) => ({
    id: price.id,
    symbol: price.symbol.toUpperCase(),
    name: price.name,
    image: price.image,
    address: generateWalletAddress(price.id),
  })) || [];

  const handleCopy = async () => {
    if (!selectedCrypto) return;
    await navigator.clipboard.writeText(selectedCrypto.address);
    setCopied(true);
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!selectedCrypto) return;
    if (navigator.share) {
      await navigator.share({
        title: `My ${selectedCrypto.name} Address`,
        text: selectedCrypto.address,
      });
    } else {
      handleCopy();
    }
  };

  const handleSimulateReceive = () => {
    if (!selectedCrypto || !simulateAmount) return;
    
    receiveCrypto({
      coinId: selectedCrypto.id,
      symbol: selectedCrypto.symbol,
      name: selectedCrypto.name,
      amount: parseFloat(simulateAmount),
      fromAddress: `0x${Math.random().toString(16).slice(2, 42)}`,
    });
    
    toast({
      title: "Funds Received!",
      description: `${simulateAmount} ${selectedCrypto.symbol} has been added to your wallet.`,
    });
    
    setSimulateAmount("");
    onOpenChange(false);
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
              <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center">
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
            
            {isLoading ? (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="w-24 h-10 rounded-full flex-shrink-0" />
                ))}
              </div>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {cryptos.map((crypto) => (
                  <button
                    key={crypto.id}
                    onClick={() => setSelectedCrypto(crypto)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap ${
                      selectedCrypto?.id === crypto.id 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <img src={crypto.image} alt={crypto.name} className="w-6 h-6 rounded-full" />
                    <span className="font-medium text-foreground">{crypto.symbol}</span>
                  </button>
                ))}
              </div>
            )}

            {selectedCrypto && (
              <>
                {/* QR Code placeholder */}
                <div className="flex flex-col items-center py-6">
                  <div className="w-48 h-48 bg-white rounded-2xl p-4 mb-4">
                    <div className="w-full h-full rounded-lg flex items-center justify-center">
                      <div className="grid grid-cols-8 gap-0.5">
                        {[...Array(64)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-4 h-4 ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`}
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

                {/* Simulate receiving for testing */}
                <div className="border-t border-border pt-4 mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Simulate receiving (for testing)</p>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={simulateAmount}
                      onChange={(e) => setSimulateAmount(e.target.value)}
                      className="flex-1 bg-secondary border-border"
                    />
                    <Button 
                      onClick={handleSimulateReceive}
                      disabled={!simulateAmount}
                      className="bg-success hover:bg-success/90"
                    >
                      Receive
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReceiveModal;
