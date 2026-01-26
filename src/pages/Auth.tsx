import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
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
const fullNameSchema = z.string().min(2, "Full name must be at least 2 characters").max(50, "Full name must be less than 50 characters");
const countrySchema = z.string().min(1, "Please select a country");

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", 
  "Japan", "South Korea", "Brazil", "India", "Mexico", "Spain", "Italy", 
  "Netherlands", "Switzerland", "Singapore", "Hong Kong", "Nigeria", "South Africa",
  "United Arab Emirates", "Saudi Arabia", "Indonesia", "Philippines", "Vietnam",
  "Thailand", "Malaysia", "Poland", "Sweden", "Norway", "Denmark", "Finland",
  "Austria", "Belgium", "Ireland", "Portugal", "New Zealand", "Argentina", "Chile",
  "Colombia", "Peru", "Egypt", "Kenya", "Ghana", "Pakistan", "Bangladesh", "Other"
];

interface FormErrors {
  email?: string;
  password?: string;
  username?: string;
  fullName?: string;
  country?: string;
}

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    if (!isLogin) {
      const usernameResult = usernameSchema.safeParse(username);
      if (!usernameResult.success) {
        newErrors.username = usernameResult.error.errors[0].message;
      }

      const fullNameResult = fullNameSchema.safeParse(fullName);
      if (!fullNameResult.success) {
        newErrors.fullName = fullNameResult.error.errors[0].message;
      }

      const countryResult = countrySchema.safeParse(country);
      if (!countryResult.success) {
        newErrors.country = countryResult.error.errors[0].message;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Login failed",
              description: "Invalid email or password. Please try again.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Login failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in.",
          });
          navigate("/");
        }
      } else {
        // Check if username is already taken
        const { data: existingUser } = await supabase
          .from("profiles")
          .select("username")
          .eq("username", username)
          .maybeSingle();

        if (existingUser) {
          toast({
            title: "Username taken",
            description: "This username is already in use. Please choose another.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        const { error, data } = await signUp(email, password);
        if (error) {
          if (error.message.includes("User already registered")) {
            toast({
              title: "Account exists",
              description: "This email is already registered. Please log in instead.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Sign up failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else if (data?.user) {
          // Update profile with additional fields
          const { error: profileError } = await supabase
            .from("profiles")
            .update({
              username,
              full_name: fullName,
              country,
              display_name: fullName || username,
            })
            .eq("user_id", data.user.id);

          if (profileError) {
            console.error("Error updating profile:", profileError);
          }

          toast({
            title: "Account created!",
            description: "You have successfully signed up and logged in.",
          });
          navigate("/");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </button>

        <div className="bg-card rounded-2xl p-6 md:p-8 border border-border">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-foreground rounded flex items-center justify-center">
              <span className="text-background font-bold text-sm">₿</span>
            </div>
            <span className="font-bold text-xl text-foreground">CryptoX</span>
          </div>

          <h2 className="text-2xl font-bold text-card-foreground mb-2">
            {isLogin ? "Welcome back" : "Create account"}
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            {isLogin
              ? "Enter your credentials to access your account"
              : "Sign up to start trading crypto"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-12"
              />
              {errors.email && (
                <p className="text-destructive text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-12 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {errors.password && (
                <p className="text-destructive text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {!isLogin && (
              <>
                <div>
                  <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                      if (errors.username) setErrors({ ...errors, username: undefined });
                    }}
                    className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-12"
                  />
                  {errors.username && (
                    <p className="text-destructive text-sm mt-1">{errors.username}</p>
                  )}
                </div>

                <div>
                  <Input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                    }}
                    className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-12"
                  />
                  {errors.fullName && (
                    <p className="text-destructive text-sm mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <Select value={country} onValueChange={(value) => {
                    setCountry(value);
                    if (errors.country) setErrors({ ...errors, country: undefined });
                  }}>
                    <SelectTrigger className="bg-secondary border-border text-foreground h-12">
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.country && (
                    <p className="text-destructive text-sm mt-1">{errors.country}</p>
                  )}
                </div>
              </>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base transition-all duration-200 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
              ) : isLogin ? (
                "Log in"
              ) : (
                "Sign up"
              )}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground mt-6 text-center">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="text-highlight hover:underline font-medium"
            >
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
