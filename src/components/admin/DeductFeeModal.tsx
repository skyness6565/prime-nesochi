import { useState } from "react";
import { Percent, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

interface DeductFeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserWithProfile | null;
}

const DeductFeeModal = ({ open, onOpenChange, user }: DeductFeeModalProps) => {
  const { deductFee, isDeductingFee } = useAdmin();
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");

  const selectedWallet = user?.wallets.find((w) => w.id === selectedWalletId);
  const feeAmount = parseFloat(amount) || 0;
  const exceedsBalance = selectedWallet ? feeAmount > selectedWallet.balance : false;

  const handleDeduct = () => {
    if (!user || !selectedWallet || !feeAmount || !narration.trim() || exceedsBalance) return;

    deductFee({
      userId: user.id,
      walletId: selectedWallet.id,
      coinId: selectedWallet.coin_id,
      symbol: selectedWallet.symbol,
      amount: feeAmount,
      narration: narration.trim(),
      currentBalance: selectedWallet.balance,
    });

    // Reset and close
    setSelectedWalletId("");
    setAmount("");
    setNarration("");
    onOpenChange(false);
  };

  const isValid =
    selectedWallet &&
    feeAmount > 0 &&
    !exceedsBalance &&
    narration.trim().length > 0;

  const displayName =
    user?.profile?.display_name || user?.profile?.username || "User";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-primary" />
            Deduct Fee
          </DialogTitle>
          <DialogDescription>
            Charge a fee on a specific crypto in{" "}
            <span className="font-medium text-foreground">{displayName}</span>
            's account. The amount will be deducted from their balance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Wallet Selection */}
          <div className="space-y-2">
            <Label>Select Crypto Wallet</Label>
            <Select value={selectedWalletId} onValueChange={setSelectedWalletId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a wallet" />
              </SelectTrigger>
              <SelectContent>
                {!user || user.wallets.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No wallets available
                  </SelectItem>
                ) : (
                  user.wallets.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{wallet.symbol}</span>
                        <span className="text-muted-foreground">
                          Balance:{" "}
                          {wallet.balance.toLocaleString(undefined, {
                            maximumFractionDigits: 8,
                          })}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Fee Amount */}
          <div className="space-y-2">
            <Label>Fee Amount {selectedWallet && `(${selectedWallet.symbol})`}</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={0}
              step="any"
            />
            {selectedWallet && (
              <p className="text-sm text-muted-foreground">
                Available:{" "}
                {selectedWallet.balance.toLocaleString(undefined, {
                  maximumFractionDigits: 8,
                })}{" "}
                {selectedWallet.symbol}
              </p>
            )}
            {exceedsBalance && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Fee exceeds wallet balance
              </p>
            )}
          </div>

          {/* Narration */}
          <div className="space-y-2">
            <Label>Narration (Reason for Fee)</Label>
            <Textarea
              placeholder="e.g., Network maintenance fee, Account verification fee..."
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              This reason will be visible to the user in their transaction history
            </p>
          </div>

          {/* Summary */}
          {isValid && selectedWallet && (
            <div className="p-3 bg-secondary rounded-lg space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current balance:</span>
                <span className="text-foreground">
                  {selectedWallet.balance.toLocaleString(undefined, {
                    maximumFractionDigits: 8,
                  })}{" "}
                  {selectedWallet.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee:</span>
                <span className="text-destructive">
                  -{feeAmount.toLocaleString(undefined, { maximumFractionDigits: 8 })}{" "}
                  {selectedWallet.symbol}
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-1">
                <span className="text-muted-foreground">New balance:</span>
                <span className="font-medium text-foreground">
                  {(selectedWallet.balance - feeAmount).toLocaleString(undefined, {
                    maximumFractionDigits: 8,
                  })}{" "}
                  {selectedWallet.symbol}
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeduct}
            disabled={!isValid || isDeductingFee}
          >
            {isDeductingFee ? "Processing..." : "Deduct Fee"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeductFeeModal;
