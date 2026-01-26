import { useState } from "react";
import { motion } from "framer-motion";
import { 
  DollarSign, 
  Snowflake, 
  Sun, 
  ChevronDown, 
  ChevronUp,
  User,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdmin, UserWithProfile } from "@/hooks/useAdmin";

interface AdminUserCardProps {
  user: UserWithProfile;
  onFund: () => void;
}

const AdminUserCard = ({ user, onFund }: AdminUserCardProps) => {
  const { toggleFreeze, isToggling } = useAdmin();
  const [expanded, setExpanded] = useState(false);
  const [freezeDialogOpen, setFreezeDialogOpen] = useState(false);
  const [freezeReason, setFreezeReason] = useState("");

  const isFrozen = user.profile?.is_frozen || false;
  const displayName = user.profile?.display_name || user.profile?.username || "Unknown User";
  const totalBalance = user.wallets.reduce((sum, w) => sum + w.balance, 0);

  const handleToggleFreeze = () => {
    if (isFrozen) {
      // Unfreeze immediately
      toggleFreeze({ userId: user.id, freeze: false });
    } else {
      // Open dialog for reason
      setFreezeDialogOpen(true);
    }
  };

  const handleConfirmFreeze = () => {
    toggleFreeze({ userId: user.id, freeze: true, reason: freezeReason });
    setFreezeDialogOpen(false);
    setFreezeReason("");
  };

  return (
    <>
      <div 
        className={`bg-card rounded-xl border transition-colors ${
          isFrozen ? "border-destructive/50 bg-destructive/5" : "border-border"
        }`}
      >
        {/* Main Row */}
        <div className="p-4 flex items-center gap-3">
          {/* Avatar */}
          {user.profile?.avatar_url ? (
            <img 
              src={user.profile.avatar_url} 
              alt={displayName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-foreground truncate">{displayName}</p>
              {isFrozen && (
                <span className="px-1.5 py-0.5 bg-destructive/20 text-destructive rounded text-xs flex items-center gap-1">
                  <Snowflake className="w-3 h-3" />
                  Frozen
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {user.profile?.country && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {user.profile.country}
                </span>
              )}
              <span>@{user.profile?.username || "—"}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onFund}
              className="h-8"
            >
              <DollarSign className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={isFrozen ? "default" : "destructive"}
              onClick={handleToggleFreeze}
              disabled={isToggling}
              className="h-8"
            >
              {isFrozen ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Snowflake className="w-4 h-4" />
              )}
            </Button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              {expanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Expanded Content */}
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border"
          >
            <div className="p-4 space-y-3">
              {/* User Details */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Full Name</p>
                  <p className="text-foreground">{user.profile?.full_name || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Username</p>
                  <p className="text-foreground">@{user.profile?.username || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Country</p>
                  <p className="text-foreground">{user.profile?.country || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Joined</p>
                  <p className="text-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Frozen Info */}
              {isFrozen && user.profile?.frozen_reason && (
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <p className="text-sm text-destructive font-medium">Freeze Reason:</p>
                  <p className="text-sm text-destructive/80">{user.profile.frozen_reason}</p>
                </div>
              )}

              {/* Wallets */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Wallets</p>
                {user.wallets.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No wallets</p>
                ) : (
                  <div className="space-y-2">
                    {user.wallets.map((wallet) => (
                      <div 
                        key={wallet.id}
                        className="flex items-center justify-between p-2 bg-secondary rounded-lg"
                      >
                        <span className="text-sm font-medium text-foreground">
                          {wallet.symbol}
                        </span>
                        <span className="text-sm text-foreground">
                          {wallet.balance.toLocaleString(undefined, { 
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 8 
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Freeze Dialog */}
      <Dialog open={freezeDialogOpen} onOpenChange={setFreezeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Freeze Account</DialogTitle>
            <DialogDescription>
              This will prevent the user from making any transactions. Please provide a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Reason for freezing (e.g., Suspicious activity)"
              value={freezeReason}
              onChange={(e) => setFreezeReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFreezeDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmFreeze}
              disabled={!freezeReason.trim()}
            >
              Freeze Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminUserCard;
