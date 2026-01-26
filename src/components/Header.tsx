import { Bell, Download, Globe, Phone, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-foreground rounded flex items-center justify-center">
            <span className="text-background font-bold text-sm">₿</span>
          </div>
          <span className="font-bold text-xl text-foreground">CryptoX</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-4">
          {user ? (
            <>
              <span className="hidden md:inline text-sm text-muted-foreground">
                {user.email}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSignOut}
                className="border-foreground text-foreground hover:bg-foreground hover:text-background transition-all duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <span className="hidden md:inline text-sm text-muted-foreground">
                Already have an account?
              </span>
              <Link to="/auth">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-foreground text-foreground hover:bg-foreground hover:text-background transition-all duration-200"
                >
                  Login
                </Button>
              </Link>
            </>
          )}
          
          <div className="hidden md:flex items-center gap-3 pl-4 border-l border-border">
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Download className="w-5 h-5" />
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Globe className="w-5 h-5" />
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Phone className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
