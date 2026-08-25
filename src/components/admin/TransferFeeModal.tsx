import { useState, useEffect } from "react";
import { Coins, Trash2, Info } from "lucide-react";
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
import { useAdmin, UserWithProfile } from "@/hooks/useAdmin";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";

interface TransferFeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserWithProfile | null;
}

const TransferFeeModal = ({ open, onOpenChange, user }: TransferFeeModalProps) => {
  const {
    transferFees,
    setTransferFee,
    removeTransferFee,
    isSettingTransferFee,
    isRemovingTransferFee,
  } = useAdmin();
  const { data: prices } = useCryptoPrices();

  const [selectedCoinId, setSelectedCoinId] = useState<string>("");
  const [feeAmount, setFeeAmount] = useState("");

  const userFees = transferFees.filter((f) => f.user_id === user?.id);
  const selectedCoin = prices?.find((p) => p.id === selectedCoinId);
  const existingFee = userFees.find((f) => f.coin_id === selectedCoinId);

  // Prefill the amount when selecting a coin that already has a fee
  useEffect(() => {
    if (existingFee) {
      setFeeAmount(String(existingFee.fee_amount));
    } else {
      setFeeAmount("");
    }
  }, [selectedCoinId]);

  const handleSave = () => {
    if (!user || !selectedCoin) return;
    const amount = parseFloat(feeAmount);
    if (isNaN(amount) || amount < 0) return;

    setTransferFee({
      userId: user.id,
      coinId: selectedCoin.id,
      symbol: selectedCoin.symbol.toUpperCase(),
      feeAmount: amount,
    });

    setSelectedCoinId("");
    setFeeAmount("");
  };

  const displayName =
    user?.profile?.display_name || user?.profile?.username || "User";

  const isValid = selectedCoin && feeAmount !== "" && parseFloat(feeAmount) >= 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            Set Transfer Fee
          </DialogTitle>
          <DialogDescription>
            Set a fixed fee on a specific crypto for{" "}
            <span className="font-medium text-foreground">{displayName}</span>.
            This fee is shown and charged automatically every time they make a
            transfer with that crypto.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Existing fees for this user */}
          {userFees.length > 0 && (
            <div className="space-y-2">
              <Label>Active Fees for {displayName}</Label>
              <div className="space-y-2">
                {userFees.map((fee) => (
                  <div
                    key={fee.id}
                    className="flex items-center justify-between p-2 bg-secondary rounded-lg"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {fee.symbol}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground">
                        {fee.fee_amount.toLocaleString(undefined, {
                          maximumFractionDigits: 8,
                        })}{" "}
                        {fee.symbol}
                      </span>
                      <button
                        onClick={() =>
                          removeTransferFee({
                            feeId: fee.id,
                            userId: fee.user_id,
                            symbol: fee.symbol,
                          })
                        }
                        disabled={isRemovingTransferFee}
                        className="p-1.5 rounded-md hover:bg-destructive/20 text-destructive transition-colors"
                        title="Remove fee"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Crypto Selection */}
          <div className="space-y-2">
            <Label>Select Crypto</Label>
            <Select value={selectedCoinId} onValueChange={setSelectedCoinId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a crypto" />
              </SelectTrigger>
              <SelectContent>
                {(prices || []).map((coin) => (
                  <SelectItem key={coin.id} value={coin.id}>
                    <div className="flex items-center gap-2">
                      <img
                        src={coin.image}
                        alt={coin.name}
                        className="w-5 h-5 rounded-full"
                      />
                      <span className="font-medium">
                        {coin.symbol.toUpperCase()}
                      </span>
                      <span className="text-muted-foreground">{coin.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fee Amount */}
          <div className="space-y-2">
            <Label>
              Fee Amount{" "}
              {selectedCoin && `(${selectedCoin.symbol.toUpperCase()})`}
            </Label>
            <Input
              type="number"
              placeholder="0.00"
              value={feeAmount}
              onChange={(e) => setFeeAmount(e.target.value)}
              min={0}
              step="any"
            />
            <p className="text-xs text-muted-foreground">
              {existingFee
                ? "This crypto already has a fee — saving will update it."
                : "Charged in the crypto being sent, on top of the transfer amount."}
            </p>
          </div>

          {isValid && selectedCoin && (
            <div className="flex items-start gap-2 p-3 bg-primary/10 rounded-lg">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">
                Every time {displayName} sends{" "}
                {selectedCoin.symbol.toUpperCase()},{" "}
                <span className="font-medium">
                  {parseFloat(feeAmount).toLocaleString(undefined, {
                    maximumFractionDigits: 8,
                  })}{" "}
                  {selectedCoin.symbol.toUpperCase()}
                </span>{" "}
                will be charged as a transfer fee.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleSave} disabled={!isValid || isSettingTransferFee}>
            {isSettingTransferFee
              ? "Saving..."
              : existingFee
                ? "Update Fee"
                : "Set Fee"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransferFeeModal;
