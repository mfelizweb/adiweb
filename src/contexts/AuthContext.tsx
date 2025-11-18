"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Session, User, AuthChangeEvent } from "@supabase/supabase-js";
import { usePushNotifications } from "@/hooks/usePushNotifications";

type AuthState = {
  loading: boolean;
  session: Session | null;
  user: User | null;
  signOut: () => Promise<void>;
  bootstrapped: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  /* ---------------- INITIAL SESSION ---------------- */
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);

        if (data.session?.user?.id) {
          try {
            usePushNotifications(data.session.user.id);
          } catch {
            /* skip web */
          }
        }
      } catch (err) {
        console.error("Error fetching session:", err);
      } finally {
        if (mounted) {
          setLoading(false);
          setBootstrapped(true);
        }
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, newSession) => {
        setSession(newSession ?? null);
        setUser(newSession?.user ?? null);
        if (newSession?.user?.id) {
          try {
            usePushNotifications(newSession.user.id);
          } catch {
            /* skip web */
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* ---------------- REFRESH ON FOCUS ---------------- */
  useEffect(() => {
    const handleFocus = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);
        if (data.session?.user?.id) {
          try {
            usePushNotifications(data.session.user.id);
          } catch {
            /* skip */
          }
        }
      } catch (err) {
        console.error("Error refreshing session on focus:", err);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  /* ---------------- VALUE ---------------- */
  const value = useMemo<AuthState>(
    () => ({
      loading,
      session,
      user,
      bootstrapped,
      setUser,
      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      },
    }),
    [loading, session, user, bootstrapped]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
