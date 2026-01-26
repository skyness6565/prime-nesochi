import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, Copy, Check, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserWallets } from "@/hooks/useUserWallets";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const WalletAddresses = () => {
  const { userWallets, isLoading: walletsLoading } = useUserWallets();
  const { data: prices, isLoading: pricesLoading } = useCryptoPrices();
  const [expanded, setExpanded] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const handleCopy = async (address: string, symbol: string) => {
    await navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    toast({
      title: "Address Copied",
      description: `${symbol} wallet address copied to clipboard`,
    });
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const getCryptoImage = (coinId: string): string => {
    const crypto = prices?.find(p => p.id === coinId);
    return crypto?.image || `https://assets.coingecko.com/coins/images/1/small/bitcoin.png`;
  };

  const getCryptoName = (coinId: string): string => {
    const crypto = prices?.find(p => p.id === coinId);
    return crypto?.name || coinId;
  };

  const isLoading = walletsLoading || pricesLoading;
  const displayedWallets = expanded ? userWallets : userWallets.slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-card rounded-2xl border border-border overflow-hidden"
    >
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">Wallet Addresses</p>
            <p className="text-sm text-muted-foreground">
              {userWallets.length} addresses available
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-border">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            </div>
          ))
        ) : displayedWallets.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            No wallet addresses found
          </div>
        ) : (
          displayedWallets.map((wallet) => (
            <div
              key={wallet.id}
              className="p-4 hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <img
                  src={getCryptoImage(wallet.coin_id)}
                  alt={wallet.symbol}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      {getCryptoName(wallet.coin_id)}
                    </span>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                      {wallet.network}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">
                    {wallet.wallet_address}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(wallet.wallet_address, wallet.symbol)}
                  className="shrink-0"
                >
                  {copiedAddress === wallet.wallet_address ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {userWallets.length > 4 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full p-3 flex items-center justify-center gap-2 text-sm text-primary hover:bg-secondary/30 transition-colors border-t border-border"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              View All {userWallets.length} Addresses
            </>
          )}
        </button>
      )}
    </motion.div>
  );
};

export default WalletAddresses;
