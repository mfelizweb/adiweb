"use client";

import { supabase } from "@/lib/supabase";

 

export function useGoogleSignIn() {
  async function signInWithGoogle() {
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : undefined;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          access_type: "offline",
          prompt: "select_account",
        },
      },
    });

    if (error) throw error;
    return data;
  }

  return { signInWithGoogle };
}
