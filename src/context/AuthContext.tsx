"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { ProfileRow } from "@/lib/supabase/database.types";
import { mapAddressRow, type SavedAddress } from "@/lib/addresses";

type AuthContextType = {
  user: User | null;
  profile: ProfileRow | null;
  addresses: SavedAddress[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    redirectPath?: string,
  ) => Promise<{ error?: string; needsConfirmation?: boolean }>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updatePassword: (password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshAddresses: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      setProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .maybeSingle();

    if (error) {
      console.error("Failed to load profile:", error.message);
      return;
    }

    if (data) {
      setProfile(data);
      return;
    }

    const { data: created, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: currentUser.id,
        full_name: (currentUser.user_metadata?.full_name as string) ?? "",
        email: currentUser.email ?? "",
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("Failed to create profile:", insertError.message);
      return;
    }

    setProfile(created);
  }, [supabase]);

  const refreshAddresses = useCallback(async () => {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      setAddresses([]);
      return;
    }

    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load addresses:", error.message);
      return;
    }

    setAddresses((data ?? []).map(mapAddressRow));
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        void Promise.all([refreshProfile(), refreshAddresses()]);
      }
    };

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        void Promise.all([refreshProfile(), refreshAddresses()]);
      } else {
        setProfile(null);
        setAddresses([]);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, refreshProfile, refreshAddresses]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    await Promise.all([refreshProfile(), refreshAddresses()]);
    return {};
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    redirectPath = "/profile",
  ) => {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        redirectPath,
      }),
    });

    const data = (await response.json()) as {
      error?: string;
      needsConfirmation?: boolean;
    };

    if (!response.ok) {
      return { error: data.error ?? "Could not create account" };
    }

    if (data.needsConfirmation) {
      return { needsConfirmation: true };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return { needsConfirmation: true };
    }

    await Promise.all([refreshProfile(), refreshAddresses()]);
    return {};
  };

  const resetPassword = async (email: string) => {
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      return { error: data.error ?? "Could not send reset email" };
    }
    return {};
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: error.message };
    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setAddresses([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        addresses,
        loading,
        signIn,
        signUp,
        resetPassword,
        updatePassword,
        signOut,
        refreshProfile,
        refreshAddresses,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
