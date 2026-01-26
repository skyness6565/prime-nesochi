import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const RegistrationForm = () => {
  const [activeTab, setActiveTab] = useState<"email" | "mobile">("email");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    referralCode: "CRYPTOX"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-md"
    >
      <div className="bg-card rounded-2xl p-6 md:p-8 border border-border">
        <h2 className="text-2xl font-bold text-card-foreground mb-2">
          Create Your Account
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          Registration takes only 30 seconds
        </p>

        {/* Tabs */}
        <div className="flex border-b border-border mb-6">
          <button
            onClick={() => setActiveTab("email")}
            className={`pb-3 px-4 text-sm font-medium transition-colors relative ${
              activeTab === "email" 
                ? "text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Email
            {activeTab === "email" && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("mobile")}
            className={`pb-3 px-4 text-sm font-medium transition-colors relative ${
              activeTab === "mobile" 
                ? "text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Mobile
            {activeTab === "mobile" && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
              />
            )}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === "email" ? (
            <div>
              <Input
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-12"
              />
            </div>
          ) : (
            <div>
              <Input
                type="tel"
                placeholder="Phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-12"
              />
            </div>
          )}

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-12 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="relative">
            <div className="absolute left-4 top-2 text-xs text-muted-foreground">
              Please enter the referral code
            </div>
            <Input
              type="text"
              value={formData.referralCode}
              onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
              className="bg-secondary border-border text-highlight placeholder:text-muted-foreground h-14 pt-5 pr-12"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-highlight rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-accent-foreground" />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base transition-all duration-200 active:scale-[0.98]"
          >
            Next
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-muted-foreground text-sm">Or register via</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            className="h-12 bg-secondary hover:bg-secondary/80 rounded-lg flex items-center justify-center transition-colors border border-border"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          </motion.button>
          
          <motion.button 
            whileTap={{ scale: 0.95 }}
            className="h-12 bg-secondary hover:bg-secondary/80 rounded-lg flex items-center justify-center transition-colors border border-border"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
          </motion.button>
          
          <motion.button 
            whileTap={{ scale: 0.95 }}
            className="h-12 bg-secondary hover:bg-secondary/80 rounded-lg flex items-center justify-center transition-colors border border-border"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
          </motion.button>
        </div>

        <p className="text-xs text-muted-foreground mt-6 text-center leading-relaxed">
          As you proceed to complete your registration, you agree to our{" "}
          <a href="#" className="text-foreground underline hover:text-highlight">User Agreement</a>,{" "}
          <a href="#" className="text-foreground underline hover:text-highlight">Privacy Policy</a> and{" "}
          <a href="#" className="text-foreground underline hover:text-highlight">Risk Disclosure</a>.
          We will never divulge any of your personal information without your prior consent.
        </p>
      </div>
    </motion.div>
  );
};

export default RegistrationForm;
