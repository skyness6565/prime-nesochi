import { useEffect } from "react";

const Admin = () => {
  useEffect(() => {
    // Redirect to external admin panel hosted on Vercel
    window.location.href = "https://jd-fahel.vercel.app/admin";
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-3 text-muted-foreground">Redirecting to admin panel...</span>
    </div>
  );
};

export default Admin;
