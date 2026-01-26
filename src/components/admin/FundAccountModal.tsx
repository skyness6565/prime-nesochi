import { useState } from "react";
import { DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdmin } from "@/hooks/useAdmin";

interface FundAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  userName: string;
}

const SUPPORTED_COINS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "tether", symbol: "USDT", name: "Tether" },
  { id: "binancecoin", symbol: "BNB", name: "BNB" },
  { id: "solana", symbol: "SOL", name: "Solana" },
  { id: "ripple", symbol: "XRP", name: "XRP" },
  { id: "usd-coin", symbol: "USDC", name: "USD Coin" },
  { id: "cardano", symbol: "ADA", name: "Cardano" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin" },
  { id: "polkadot", symbol: "DOT", name: "Polkadot" },
];

const FundAccountModal = ({
  open,
  onOpenChange,
  userId,
  userName,
}: FundAccountModalProps) => {
  const { fundAccount, isFunding } = useAdmin();
  const [selectedCoin, setSelectedCoin] = useState<string>("");
  const [amount, setAmount] = useState("");

  const handleFund = () => {
    if (!userId || !selectedCoin || !amount) return;

    const coin = SUPPORTED_COINS.find((c) => c.id === selectedCoin);
    if (!coin) return;

    fundAccount({
      userId,
      coinId: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      amount: parseFloat(amount),
    });

    // Reset and close
    setSelectedCoin("");
    setAmount("");
    onOpenChange(false);
  };

  const isValid = selectedCoin && amount && parseFloat(amount) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Fund Account
          </DialogTitle>
          <DialogDescription>
            Add funds to <span className="font-medium text-foreground">{userName}</span>'s wallet
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Coin Selection */}
          <div className="space-y-2">
            <Label>Select Cryptocurrency</Label>
            <Select value={selectedCoin} onValueChange={setSelectedCoin}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a coin" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_COINS.map((coin) => (
                  <SelectItem key={coin.id} value={coin.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{coin.symbol}</span>
                      <span className="text-muted-foreground">{coin.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={0}
              step="any"
            />
            {selectedCoin && (
              <p className="text-sm text-muted-foreground">
                {SUPPORTED_COINS.find((c) => c.id === selectedCoin)?.symbol} will be added to the user's wallet
              </p>
            )}
          </div>

          {/* Quick amounts */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Quick Amounts</Label>
            <div className="flex flex-wrap gap-2">
              {["0.1", "0.5", "1", "5", "10", "100"].map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(quickAmount)}
                  className={amount === quickAmount ? "border-primary" : ""}
                >
                  {quickAmount}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleFund} disabled={!isValid || isFunding}>
            {isFunding ? "Processing..." : "Fund Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FundAccountModal;
