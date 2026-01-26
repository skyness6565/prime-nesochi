import { Bell, Download, Globe, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-foreground rounded flex items-center justify-center">
            <span className="text-background font-bold text-sm">₿</span>
          </div>
          <span className="font-bold text-xl text-foreground">CryptoX</span>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <span className="hidden md:inline text-sm text-muted-foreground">
            Already have an account?
          </span>
          <Button 
            variant="outline" 
            size="sm"
            className="border-foreground text-foreground hover:bg-foreground hover:text-background transition-all duration-200"
          >
            Login
          </Button>
          
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
