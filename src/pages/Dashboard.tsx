import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import WalletHeader from "@/components/wallet/WalletHeader";
import WalletBalance from "@/components/wallet/WalletBalance";
import QuickActions from "@/components/wallet/QuickActions";
import CryptoAssets from "@/components/wallet/CryptoAssets";
import TransactionHistory from "@/components/wallet/TransactionHistory";
import BottomNavigation from "@/components/wallet/BottomNavigation";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-background pb-20">
      <WalletHeader />
      
      <main className="container mx-auto px-4 py-4 space-y-6 max-w-lg">
        <WalletBalance />
        <QuickActions />
        <CryptoAssets />
        <TransactionHistory />
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Dashboard;
