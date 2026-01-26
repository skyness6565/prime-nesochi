import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import RegistrationForm from "@/components/RegistrationForm";
import FeatureList from "@/components/FeatureList";
import Dashboard from "./Dashboard";

const Index = () => {
  const { user, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is logged in, show the wallet dashboard
  if (user) {
    return <Dashboard />;
  }

  // Otherwise show the landing page
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-12 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 lg:gap-16">
            {/* Left side - Hero & Features */}
            <div className="flex-1">
              <HeroSection />
              <FeatureList />
            </div>
            
            {/* Right side - Registration Form */}
            <div className="w-full lg:w-auto lg:sticky lg:top-24">
              <RegistrationForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
