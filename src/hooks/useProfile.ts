import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  username: string | null;
  full_name: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error("Error fetching profile:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Pick<Profile, "display_name" | "avatar_url" | "username" | "full_name" | "country">>) => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id);

      if (error) throw error;

      setProfile((prev) => prev ? { ...prev, ...updates } : null);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return { error: new Error("Not authenticated"), url: null };

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      await updateProfile({ avatar_url: publicUrl });

      return { error: null, url: publicUrl };
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      return { error, url: null };
    }
  };

  return {
    profile,
    loading,
    updateProfile,
    uploadAvatar,
    refetch: fetchProfile,
  };
};
