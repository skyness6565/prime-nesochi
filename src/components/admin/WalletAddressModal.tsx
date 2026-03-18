import { Wallet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserWithProfile } from "@/hooks/useAdmin";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WalletAddressModalProps {
  user: UserWithProfile;
  open: boolean;
  onClose: () => void;
}

const WalletAddressModal = ({ user, open, onClose }: WalletAddressModalProps) => {
  const displayName = user.profile?.display_name || user.profile?.username || "User";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Wallet className="w-5 h-5" />
            Wallet Addresses
          </DialogTitle>
          <DialogDescription>
            Wallet addresses for {displayName} (read-only)
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px]">
          <div className="space-y-3 pr-4">
            {user.walletAddresses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No wallet addresses configured
              </p>
            ) : (
              user.walletAddresses.map((address) => (
                <div
                  key={address.id}
                  className="p-3 bg-secondary rounded-lg space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      {address.symbol}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {address.network}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono break-all">
                    {address.wallet_address}
                  </p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default WalletAddressModal;
