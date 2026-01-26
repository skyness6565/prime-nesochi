import { Bell, Settings, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";

const WalletHeader = () => {
  const { profile } = useProfile();
  const { user } = useAuth();

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "User";
  const avatarUrl = profile?.avatar_url;

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/profile">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt="Avatar" 
                className="w-10 h-10 rounded-full object-cover border-2 border-primary"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-highlight flex items-center justify-center text-primary-foreground font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
          <div>
            <p className="text-sm text-muted-foreground">Welcome back</p>
            <p className="font-semibold text-foreground">{displayName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors relative">
            <Bell className="w-5 h-5 text-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-highlight rounded-full" />
          </button>
          <Link 
            to="/profile"
            className="p-2.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <Settings className="w-5 h-5 text-foreground" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default WalletHeader;
