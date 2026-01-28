import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const usernameSchema = z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be less than 20 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores");
const countrySchema = z.string().min(1, "Please select a country");
const COUNTRIES = ["United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Japan", "South Korea", "Brazil", "India", "Mexico", "Spain", "Italy", "Netherlands", "Switzerland", "Singapore", "Hong Kong", "Nigeria", "South Africa", "United Arab Emirates", "Saudi Arabia", "Indonesia", "Philippines", "Vietnam", "Thailand", "Malaysia", "Poland", "Sweden", "Norway", "Denmark", "Finland", "Austria", "Belgium", "Ireland", "Portugal", "New Zealand", "Argentina", "Chile", "Colombia", "Peru", "Egypt", "Kenya", "Ghana", "Pakistan", "Bangladesh", "Other"];
interface FormErrors {
  email?: string;
  password?: string;
  username?: string;
  country?: string;
}
const RegistrationForm = () => {
  const [activeTab, setActiveTab] = useState<"email" | "mobile">("email");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    username: "",
    country: "",
    referralCode: "CRYPTOX"
  });
  const {
    signUp,
    user
  } = useAuth();
  const navigate = useNavigate();
  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (activeTab === "email") {
      const emailResult = emailSchema.safeParse(formData.email);
      if (!emailResult.success) {
        newErrors.email = emailResult.error.errors[0].message;
      }
    }
    const passwordResult = passwordSchema.safeParse(formData.password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }
    const usernameResult = usernameSchema.safeParse(formData.username);
    if (!usernameResult.success) {
      newErrors.username = usernameResult.error.errors[0].message;
    }
    const countryResult = countrySchema.safeParse(formData.country);
    if (!countryResult.success) {
      newErrors.country = countryResult.error.errors[0].message;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "mobile") {
      toast({
        title: "Coming soon",
        description: "Phone registration will be available soon. Please use email for now."
      });
      return;
    }
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      // Check if username is already taken
      const {
        data: existingUser
      } = await supabase.from("profiles").select("username").eq("username", formData.username).maybeSingle();
      if (existingUser) {
        toast({
          title: "Username taken",
          description: "This username is already in use. Please choose another.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      const {
        error,
        data
      } = await signUp(formData.email, formData.password);
      if (error) {
        if (error.message.includes("User already registered")) {
          toast({
            title: "Account exists",
            description: "This email is already registered. Please log in instead.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Registration failed",
            description: error.message,
            variant: "destructive"
          });
        }
      } else if (data?.user) {
        // Update profile with additional fields
        const {
          error: profileError
        } = await supabase.from("profiles").update({
          username: formData.username,
          country: formData.country,
          display_name: formData.username
        }).eq("user_id", data.user.id);
        if (profileError) {
          console.error("Error updating profile:", profileError);
        }
        toast({
          title: "Welcome to Prime Wallet!",
          description: "Your account has been created successfully."
        });
        navigate("/");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user is already logged in, show a different message
  if (user) {
    return <motion.div initial={{
      opacity: 0,
      x: 20
    }} animate={{
      opacity: 1,
      x: 0
    }} transition={{
      duration: 0.5,
      delay: 0.2
    }} className="w-full max-w-md">
        <div className="bg-card rounded-2xl p-6 md:p-8 border border-border text-center">
          <div className="w-16 h-16 bg-highlight/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-highlight" />
          </div>
          <h2 className="text-2xl font-bold text-card-foreground mb-2">
            You're logged in!
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Welcome back, {user.email}
          </p>
          <Button onClick={() => navigate("/")} className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base">
            Start Trading
          </Button>
        </div>
      </motion.div>;
  }
  return <motion.div initial={{
    opacity: 0,
    x: 20
  }} animate={{
    opacity: 1,
    x: 0
  }} transition={{
    duration: 0.5,
    delay: 0.2
  }} className="w-full max-w-md">
      <div className="bg-card rounded-2xl p-6 md:p-8 border border-border">
        <h2 className="text-2xl font-bold text-card-foreground mb-2">
          Create Your Account
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          Registration takes only 30 seconds
        </p>

        {/* Tabs */}
        <div className="flex border-b border-border mb-6">
          <button onClick={() => setActiveTab("email")} className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === "email" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            Email
            {activeTab === "email" && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />}
          </button>
          <button onClick={() => setActiveTab("mobile")} className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === "mobile" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            Mobile
            {activeTab === "mobile" && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === "email" ? <div>
              <Input type="email" placeholder="Email address" value={formData.email} onChange={e => {
            setFormData({
              ...formData,
              email: e.target.value
            });
            if (errors.email) setErrors({
              ...errors,
              email: undefined
            });
          }} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-12" />
              {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
            </div> : <div>
              <Input type="tel" placeholder="Phone number" value={formData.phone} onChange={e => setFormData({
            ...formData,
            phone: e.target.value
          })} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-12" />
            </div>}

          <div className="relative">
            <Input type={showPassword ? "text" : "password"} placeholder="Create a password" value={formData.password} onChange={e => {
            setFormData({
              ...formData,
              password: e.target.value
            });
            if (errors.password) setErrors({
              ...errors,
              password: undefined
            });
          }} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-12 pr-12" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            {errors.password && <p className="text-destructive text-sm mt-1">{errors.password}</p>}
          </div>

          {/* Username field */}
          <div>
            <Input type="text" placeholder="Username" value={formData.username} onChange={e => {
            setFormData({
              ...formData,
              username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
            });
            if (errors.username) setErrors({
              ...errors,
              username: undefined
            });
          }} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-12" />
            {errors.username && <p className="text-destructive text-sm mt-1">{errors.username}</p>}
          </div>

          {/* Country field */}
          <div>
            <Select value={formData.country} onValueChange={value => {
            setFormData({
              ...formData,
              country: value
            });
            if (errors.country) setErrors({
              ...errors,
              country: undefined
            });
          }}>
              <SelectTrigger className="bg-secondary border-border text-foreground h-12">
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.country && <p className="text-destructive text-sm mt-1">{errors.country}</p>}
          </div>

          <div className="relative">
            <div className="absolute left-4 top-2 text-xs text-muted-foreground">
              Please enter the referral code
            </div>
            <Input type="text" value={formData.referralCode} onChange={e => setFormData({
            ...formData,
            referralCode: e.target.value
          })} className="bg-secondary border-border text-highlight placeholder:text-muted-foreground h-14 pt-5 pr-12" />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-highlight rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-accent-foreground" />
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base transition-all duration-200 active:scale-[0.98]">
            {isSubmitting ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div> : "Next"}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-muted-foreground text-sm">Or register via</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Social Buttons */}
        

        <p className="text-xs text-muted-foreground mt-6 text-center leading-relaxed">
          As you proceed to complete your registration, you agree to our{" "}
          <a href="#" className="text-foreground underline hover:text-highlight">User Agreement</a>,{" "}
          <a href="#" className="text-foreground underline hover:text-highlight">Privacy Policy</a> and{" "}
          <a href="#" className="text-foreground underline hover:text-highlight">Risk Disclosure</a>.
          We will never divulge any of your personal information without your prior consent.
        </p>
      </div>
    </motion.div>;
};
export default RegistrationForm;