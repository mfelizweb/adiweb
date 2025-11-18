 "use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type SignUpMeta = { name?: string };

export function useEmailAuth() {
  const [loading, setLoading] = useState(false);

  /* ---------------- SIGN UP ---------------- */
  const signUpWithEmail = async (email: string, password: string, meta?: SignUpMeta) => {
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: meta ?? {},
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (e: any) {
      console.error("❌ Error en signUpWithEmail:", e);
      return { data: null, error: e };
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SIGN IN ---------------- */
  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { data, error: null };
    } catch (e: any) {
      console.error("❌ Error en signInWithEmail:", e);
      return { data: null, error: e };
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- MAGIC LINK (opcional) ---------------- */
  const sendMagicLink = async (email: string) => {
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;

      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectUrl },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (e: any) {
      console.error("❌ Error en sendMagicLink:", e);
      return { data: null, error: e };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    signUpWithEmail,
    signInWithEmail,
    sendMagicLink,
  };
}
