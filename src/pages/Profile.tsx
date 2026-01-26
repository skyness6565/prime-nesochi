import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Camera, 
  User, 
  Mail, 
  Shield, 
  Bell, 
  Moon, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Check,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useAdmin } from "@/hooks/useAdmin";
import { useSettings } from "@/contexts/SettingsContext";
import { toast } from "@/hooks/use-toast";
import BottomNavigation from "@/components/wallet/BottomNavigation";
import CurrencyLanguageSettings from "@/components/settings/CurrencyLanguageSettings";
import WalletAddresses from "@/components/profile/WalletAddresses";

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, updateProfile, uploadAvatar, loading } = useProfile();
  const { isAdmin } = useAdmin();
  const { t } = useSettings();
  
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    await uploadAvatar(file);
    setUploading(false);
  };

  const handleSaveDisplayName = async () => {
    if (displayName.trim()) {
      await updateProfile({ display_name: displayName.trim() });
      setIsEditing(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const menuItems = [
    { icon: Shield, label: t("security"), description: t("twoFAPassword"), onClick: () => {} },
    { icon: Bell, label: t("notifications"), description: t("pushEmail"), onClick: () => {} },
    { icon: Moon, label: t("appearance"), description: t("darkMode"), onClick: () => {} },
    { icon: HelpCircle, label: t("helpSupport"), description: t("faqContact"), onClick: () => {} },
    ...(isAdmin ? [{ 
      icon: Settings, 
      label: t("adminPanel"), 
      description: t("manageUsersSettings"), 
      onClick: () => navigate("/admin") 
    }] : []),
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentDisplayName = profile?.display_name || user?.email?.split("@")[0] || "User";
  const avatarUrl = profile?.avatar_url;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">{t("profile")}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6 max-w-lg">
        {/* Avatar Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <div className="relative mb-4">
            <button 
              onClick={handleAvatarClick}
              disabled={uploading}
              className="relative group"
            >
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Avatar" 
                  className="w-24 h-24 rounded-full object-cover border-4 border-primary"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-highlight flex items-center justify-center text-primary-foreground text-3xl font-bold border-4 border-primary">
                  {currentDisplayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {uploading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Display Name */}
          {isEditing ? (
            <div className="flex items-center gap-2 w-full max-w-xs">
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter display name"
                className="bg-secondary border-border h-10"
                autoFocus
              />
              <Button size="sm" onClick={handleSaveDisplayName}>
                <Check className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <button 
              onClick={() => {
                setDisplayName(currentDisplayName);
                setIsEditing(true);
              }}
              className="flex items-center gap-2 hover:opacity-70 transition-opacity"
            >
              <h2 className="text-xl font-bold text-foreground">{currentDisplayName}</h2>
              <User className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          
          <p className="text-muted-foreground text-sm mt-1">{user?.email}</p>
        </motion.div>

        {/* Account Info Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-highlight/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-highlight" />
            </div>
            <div>
              <p className="font-medium text-foreground">{t("verifiedAccount")}</p>
              <p className="text-sm text-muted-foreground">{t("identityVerified")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{user?.email}</span>
            <span className="ml-auto px-2 py-0.5 bg-highlight/20 text-highlight rounded-full text-xs">
              {t("verified")}
            </span>
          </div>
        </motion.div>

        {/* Wallet Addresses */}
        <WalletAddresses />

        {/* Currency & Language Settings */}
        <CurrencyLanguageSettings />

        {/* Menu Items */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl border border-border overflow-hidden"
        >
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="w-full flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors border-b border-border last:border-b-0"
            >
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <item.icon className="w-5 h-5 text-foreground" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-foreground">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </motion.div>

        {/* Logout Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="w-full h-12 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <LogOut className="w-5 h-5 mr-2" />
            {t("signOut")}
          </Button>
        </motion.div>

        {/* App Version */}
        <p className="text-center text-sm text-muted-foreground">
          {t("appVersion")}
        </p>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Profile;
