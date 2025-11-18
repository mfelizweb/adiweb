// components/LoginModal.tsx (web)
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { t } from "@/i18n/config";
import { Loader2, LogIn } from "lucide-react";
import Image from "next/image";

interface Props {
  open: boolean;
  onClose: () => void;
  lang?: "en" | "es";
}

export default function LoginModal({ open, onClose, lang = "es" }: Props) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleEmailAuth = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      if (!email || !password) throw new Error("Email y contraseña requeridos");

      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (error) throw error;
      }

      onClose();
    } catch (e: any) {
      setErrorMsg(e.message || "Error de autenticación");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (e: any) {
      setErrorMsg(e.message || "Error con Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-semibold text-gray-900">
            {t(lang, "loginToContinue")}
          </DialogTitle>
        </DialogHeader>

        {/* Toggle Sign In / Sign Up */}
        <div className="flex justify-center gap-2 mt-3 mb-5">
          {["signin", "signup"].map((m) => (
            <Button
              key={m}
              variant={mode === m ? "default" : "outline"}
              onClick={() => setMode(m as any)}
              className="flex-1"
            >
              {m === "signin" ? t(lang, "signIn") : t(lang, "signUp")}
            </Button>
          ))}
        </div>

        {/* Formulario */}
        <div className="space-y-3">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder={t(lang, "password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {mode === "signup" && (
            <Input
              placeholder={t(lang, "nameOptional")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}

          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            onClick={handleEmailAuth}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                {mode === "signin"
                  ? t(lang, "signinWithEmail")
                  : t(lang, "signupWithEmail")}
              </span>
            )}
          </Button>
        </div>

        {/* Google Button */}
        <Button
          variant="outline"
          className="w-full mt-4 flex items-center justify-center gap-2"
          onClick={handleGoogleAuth}
          disabled={loading}
        >
          <Image src="/google-logo.png" alt="Google" width={18} height={18} />
          <span>{t(lang, "continueWithGoogle")}</span>
        </Button>

        {/* Cancel */}
        <button
          onClick={onClose}
          className="block mx-auto mt-5 text-sm text-gray-500 hover:underline"
        >
          ✕ {t(lang, "cancel")}
        </button>
      </DialogContent>
    </Dialog>
  );
}
