import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import WalletHeader from "@/components/wallet/WalletHeader";
import WalletBalance from "@/components/wallet/WalletBalance";
import QuickActions from "@/components/wallet/QuickActions";
import PortfolioChart from "@/components/wallet/PortfolioChart";
import CryptoAssets from "@/components/wallet/CryptoAssets";
import TransactionHistory from "@/components/wallet/TransactionHistory";
import BottomNavigation from "@/components/wallet/BottomNavigation";
import AccountFrozenBanner from "@/components/wallet/AccountFrozenBanner";
import { useWallet } from "@/hooks/useWallet";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useAccountStatus } from "@/hooks/useAdmin";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { wallets } = useWallet();
  const { data: prices } = useCryptoPrices();
  const { data: accountStatus } = useAccountStatus();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  // Calculate total balance for the chart
  const totalBalance = wallets.reduce((total, wallet) => {
    const price = prices?.find((p) => p.id === wallet.coin_id);
    if (price) {
      return total + wallet.balance * price.current_price;
    }
    return total;
  }, 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      <WalletHeader />
      
      <main className="container mx-auto px-4 py-4 space-y-6 max-w-lg">
        {/* Account Frozen Banner */}
        {accountStatus?.is_frozen && (
          <AccountFrozenBanner reason={accountStatus.frozen_reason} />
        )}
        
        <WalletBalance />
        <QuickActions disabled={accountStatus?.is_frozen} />
        <PortfolioChart totalBalance={totalBalance} />
        <CryptoAssets />
        <TransactionHistory />
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Dashboard;
