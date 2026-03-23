"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export type ProfileData = {
  id: string;
  full_name: string;
  email?: string;
  phone_number?: string;
  avatar_url?: string;
  address?: string;
  auth_provider?: string;
  is_blocked?: boolean;
};

type AuthContextType = {
  user: User | null;
  profile: ProfileData | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<ProfileData>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setIsLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
    setIsLoading(false);
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/order-success` } // temporary redirect to test auth loop
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<ProfileData>) => {
    if (!user) return;
    
    const payload = profile 
      ? { ...profile, ...updates } 
      : { id: user.id, full_name: user?.user_metadata?.full_name || "User", ...updates };
      
    const { data, error } = await supabase.from('profiles').upsert(payload).select().single();
    if (error) {
      console.error("Profile Upsert Error:", error);
      throw error;
    }
    if (data) setProfile(data);
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;
    
    const { error: uploadError } = await supabase.storage.from('poster_store_media').upload(filePath, file);
    if (uploadError) {
      console.error(uploadError);
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage.from('poster_store_media').getPublicUrl(filePath);
    await updateProfile({ avatar_url: publicUrl });
    return publicUrl;
  };

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, signInWithGoogle, signOut, updateProfile, uploadAvatar }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
