import { useState } from "react";
import { Wallet, Plus, Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useAdmin, UserWithProfile, UserWalletAddress } from "@/hooks/useAdmin";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WalletAddressModalProps {
  user: UserWithProfile;
  open: boolean;
  onClose: () => void;
}

const SUPPORTED_COINS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", network: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", network: "Ethereum" },
  { id: "tether", symbol: "USDT", name: "Tether", network: "Ethereum" },
  { id: "solana", symbol: "SOL", name: "Solana", network: "Solana" },
  { id: "binancecoin", symbol: "BNB", name: "BNB", network: "BNB Smart Chain" },
  { id: "ripple", symbol: "XRP", name: "XRP", network: "XRP Ledger" },
  { id: "cardano", symbol: "ADA", name: "Cardano", network: "Cardano" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin", network: "Dogecoin" },
  { id: "polkadot", symbol: "DOT", name: "Polkadot", network: "Polkadot" },
  { id: "avalanche-2", symbol: "AVAX", name: "Avalanche", network: "Avalanche C-Chain" },
  { id: "chainlink", symbol: "LINK", name: "Chainlink", network: "Ethereum" },
  { id: "polygon", symbol: "MATIC", name: "Polygon", network: "Polygon" },
  { id: "uniswap", symbol: "UNI", name: "Uniswap", network: "Ethereum" },
  { id: "litecoin", symbol: "LTC", name: "Litecoin", network: "Litecoin" },
  { id: "cosmos", symbol: "ATOM", name: "Cosmos", network: "Cosmos" },
];

const WalletAddressModal = ({ user, open, onClose }: WalletAddressModalProps) => {
  const { updateWalletAddress, isUpdatingAddress } = useAdmin();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [addingNew, setAddingNew] = useState(false);
  const [newCoin, setNewCoin] = useState("");
  const [newAddress, setNewAddress] = useState("");

  const displayName = user.profile?.display_name || user.profile?.username || "User";

  const handleEdit = (address: UserWalletAddress) => {
    setEditingId(address.id);
    setEditValue(address.wallet_address);
  };

  const handleSaveEdit = (address: UserWalletAddress) => {
    if (!editValue.trim()) return;
    
    updateWalletAddress({
      userId: user.id,
      coinId: address.coin_id,
      symbol: address.symbol,
      network: address.network,
      walletAddress: editValue.trim(),
      existingId: address.id,
    });
    setEditingId(null);
    setEditValue("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleAddNew = () => {
    if (!newCoin || !newAddress.trim()) return;
    
    const coin = SUPPORTED_COINS.find((c) => c.id === newCoin);
    if (!coin) return;

    updateWalletAddress({
      userId: user.id,
      coinId: coin.id,
      symbol: coin.symbol,
      network: coin.network,
      walletAddress: newAddress.trim(),
    });
    
    setAddingNew(false);
    setNewCoin("");
    setNewAddress("");
  };

  // Filter out coins that already have addresses
  const existingCoinIds = user.walletAddresses.map((wa) => wa.coin_id);
  const availableCoins = SUPPORTED_COINS.filter((c) => !existingCoinIds.includes(c.id));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Wallet className="w-5 h-5" />
            Wallet Addresses
          </DialogTitle>
          <DialogDescription>
            Manage wallet addresses for {displayName}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px]">
          <div className="space-y-3 pr-4">
            {/* Existing Addresses */}
            {user.walletAddresses.length === 0 && !addingNew ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No wallet addresses configured
              </p>
            ) : (
              user.walletAddresses.map((address) => (
                <div
                  key={address.id}
                  className="p-3 bg-secondary rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {address.symbol}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {address.network}
                      </span>
                    </div>
                    {editingId !== address.id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(address)}
                        className="h-7 w-7 p-0"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>

                  {editingId === address.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder="Wallet address"
                        className="flex-1 h-8 text-xs bg-background border-border"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(address)}
                        disabled={isUpdatingAddress || !editValue.trim()}
                        className="h-8 w-8 p-0"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground font-mono break-all">
                      {address.wallet_address}
                    </p>
                  )}
                </div>
              ))
            )}

            {/* Add New Address */}
            {addingNew ? (
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg space-y-3">
                <p className="text-sm font-medium text-foreground">Add New Address</p>
                <Select value={newCoin} onValueChange={setNewCoin}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Select cryptocurrency" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCoins.map((coin) => (
                      <SelectItem key={coin.id} value={coin.id}>
                        {coin.symbol} - {coin.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Wallet address"
                  className="bg-background border-border"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddNew}
                    disabled={isUpdatingAddress || !newCoin || !newAddress.trim()}
                    className="flex-1"
                  >
                    Add Address
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAddingNew(false);
                      setNewCoin("");
                      setNewAddress("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              availableCoins.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setAddingNew(true)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Wallet Address
                </Button>
              )
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default WalletAddressModal;
