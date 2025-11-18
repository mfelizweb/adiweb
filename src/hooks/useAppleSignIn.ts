 "use client";

import { supabase } from "@/lib/supabase";

export function useAppleSignIn() {
  async function signInWithApple() {
    try {
      if (typeof window === "undefined") return;

      const redirectTo = `${window.location.origin}/auth/callback`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo,
          queryParams: {
            response_mode: "form_post",
            scope: "name email",
          },
        },
      });

      if (error) throw error;

      // Apple siempre devuelve URL para redirigir
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("❌ Error Apple OAuth Web:", err);
      throw err;
    }
  }

  return { signInWithApple };
}
