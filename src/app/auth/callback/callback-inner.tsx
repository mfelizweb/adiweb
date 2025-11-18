"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";

export default function CallbackInner() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    async function handleOAuth() {
      const code = params.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) console.error("Error exchanging code:", error);
      }

      router.replace("/profile");
    }

    handleOAuth();
  }, [params, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>...</p>
    </div>
  );
}
