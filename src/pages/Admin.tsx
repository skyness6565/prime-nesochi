import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Users, 
  Settings, 
  DollarSign,
  Shield,
  Snowflake,
  Plus,
  Search,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/contexts/AuthContext";
import AdminUserCard from "@/components/admin/AdminUserCard";
import AdminFeeSettings from "@/components/admin/AdminFeeSettings";
import FundAccountModal from "@/components/admin/FundAccountModal";

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isCheckingAdmin, users, settings, isLoading } = useAdmin();
  const [searchQuery, setSearchQuery] = useState("");
  const [fundModalOpen, setFundModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Redirect if not authenticated
  if (!authLoading && !user) {
    navigate("/auth");
    return null;
  }

  // Show loading while checking admin status
  if (isCheckingAdmin || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground max-w-md">
            You don't have permission to access the admin panel.
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter((u) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      u.profile?.display_name?.toLowerCase().includes(searchLower) ||
      u.profile?.username?.toLowerCase().includes(searchLower) ||
      u.profile?.full_name?.toLowerCase().includes(searchLower) ||
      u.email.toLowerCase().includes(searchLower)
    );
  });

  const handleFundUser = (userId: string) => {
    setSelectedUserId(userId);
    setFundModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">Admin Panel</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="w-full grid grid-cols-2 h-12">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-xl border border-border p-4 text-center"
              >
                <p className="text-2xl font-bold text-foreground">{users.length}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-xl border border-border p-4 text-center"
              >
                <p className="text-2xl font-bold text-highlight">
                  {users.filter((u) => !u.profile?.is_frozen).length}
                </p>
                <p className="text-xs text-muted-foreground">Active</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-xl border border-border p-4 text-center"
              >
                <p className="text-2xl font-bold text-destructive">
                  {users.filter((u) => u.profile?.is_frozen).length}
                </p>
                <p className="text-xs text-muted-foreground">Frozen</p>
              </motion.div>
            </div>

            {/* Users List */}
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No users found
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((u, index) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <AdminUserCard
                      user={u}
                      onFund={() => handleFundUser(u.id)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <AdminFeeSettings settings={settings} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Fund Account Modal */}
      <FundAccountModal
        open={fundModalOpen}
        onOpenChange={setFundModalOpen}
        userId={selectedUserId}
        userName={
          users.find((u) => u.id === selectedUserId)?.profile?.display_name ||
          users.find((u) => u.id === selectedUserId)?.profile?.username ||
          "User"
        }
      />
    </div>
  );
};

export default Admin;
