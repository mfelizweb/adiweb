"use client";
export const dynamic = "force-dynamic";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { t } from "@/i18n/config";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStateContext } from "@/contexts/StateContext";
import { useOverlay } from "@/contexts/OverlayContext";
import { useGoogleSignIn } from "@/hooks/useGoogleSignIn";
import { signInWithApple } from "@/hooks/useAppleSignIn";
import { useEmailAuth } from "@/hooks/useEmailAuth";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Menu,
  Upload,
  LogOut,
  Star,
  MapPin,
  MessageSquare,
  Share2,
  Cloud,
  CloudOff,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";




export default function ProfilePage() {
  const { language: lang } = useLanguage();
  const { region, state } = useStateContext();
  const { openLanguage, openState } = useOverlay();
  const { signInWithGoogle } = useGoogleSignIn();
  const { signOut, user, setUser, bootstrapped } = useAuth();
  const { loading: emailLoading, signInWithEmail, signUpWithEmail } =
    useEmailAuth();

  const [editName, setEditName] = useState(false);
  const [newName, setNewName] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [offlineEnabled, setOfflineEnabled] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [nameLoading, setNameLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
const router = useRouter();


  const toggleOfflineMode = async () => {
    if (!offlineEnabled) {
      localStorage.setItem("offline_mode", "true");
      toast.info(t(lang, "offline_mode_enabled_title"), {
        description: t(lang, "offline_mode_enabled_message"),
      });
    } else {
      localStorage.removeItem("offline_mode");
      toast.info(t(lang, "offline_mode_disabled_title"), {
        description: t(lang, "offline_mode_disabled_message"),
      });
    }
    setOfflineEnabled(!offlineEnabled);
  };

  useEffect(() => {
    const mode = localStorage.getItem("offline_mode");
    setOfflineEnabled(mode === "true");
  }, []);

  useEffect(() => {
    if (user?.id) fetchProfile();
  }, [user, region, state]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("name, photo_url, email")
      .eq("id", user.id)
      .single();
    if (!error && data) {
      setNewName(data.name || "");
      if (data.photo_url) setPhotoUrl(data.photo_url);
    }
  };

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      setUser(null);
    } catch (e: any) {
      toast.error(e?.message ?? "Logout error");
    }
  }, [signOut, setUser]);

  const handleSaveName = async () => {
    if (!newName.trim()) {
      toast.error(t(lang, "name_required"));
      return;
    }
    setNameLoading(true);
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ name: newName.trim(), photo_url: photoUrl ?? null })
      .eq("id", user.id);
    if (error) toast.error(t(lang, "name_error"));
    else toast.success(t(lang, "name_updated"));
    setEditName(false);
    setNameLoading(false);
  };

  const handleEmailAuth = async () => {
    if (!email.trim() || !pwd.trim()) {
      toast.error("Email y contraseña son requeridos");
      return;
    }
    setAuthLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await signInWithEmail(email.trim(), pwd);
        if (error) throw error;
        const { data: u } = await supabase.auth.getUser();
        setUser(u?.user ?? null);
      } else {
        const { data, error } = await signUpWithEmail(email.trim(), pwd, {
          name: newName || undefined,
        });
        if (error) throw error;
        if (!data?.session)
          toast.info("Cuenta creada. Revisa tu email para confirmar.");
        else {
          const { data: u } = await supabase.auth.getUser();
          setUser(u?.user ?? null);
        }
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Error de autenticación");
    } finally {
      setAuthLoading(false);
    }
  };

  if (!bootstrapped) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {t(lang, "myAccount")}
        </h1>
 
      </div>

      {/* Idioma */}
      <div>
        <p className="text-sm text-slate-500 font-semibold uppercase mb-1">
          {t(lang, "language")}
        </p>
        <Button
          onClick={openLanguage}
          variant="outline"
          className="w-full justify-between rounded-xl"
        >
          {lang === "es" ? "Español" : "English"} 🌐
        </Button>
      </div>

      {/* Región */}
      <div>
        <p className="text-sm text-slate-500 font-semibold uppercase mb-1">
          {t(lang, "location")}
        </p>
        <Button
          onClick={openState}
          variant="outline"
          className="w-full justify-between rounded-xl"
        >
          {state
            ? `${state}, ${region}`
            : `🌎 ${t(lang, "all_places_in")} ${region}`}
        </Button>
      </div>

      {/* Bloque principal */}
      {!user ? (
        <Card className="p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={mode === "signin" ? "default" : "outline"}
              onClick={() => setMode("signin")}
              className="flex-1 rounded-xl"
            >
              {t(lang, "signin")}
            </Button>
            <Button
              variant={mode === "signup" ? "default" : "outline"}
              onClick={() => setMode("signup")}
              className="flex-1 rounded-xl"
            >
              {t(lang, "signup")}
            </Button>
          </div>

          <div className="space-y-3">
            <Input
              type="email"
              placeholder={t(lang, "email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder={t(lang, "password")}
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
            />
            {mode === "signup" && (
              <Input
                placeholder={t(lang, "name")}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            )}
            <Button
              onClick={handleEmailAuth}
              disabled={authLoading || emailLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 rounded-xl"
            >
              {authLoading || emailLoading
                ? "..."
                : mode === "signin"
                ? t(lang, "signinWithEmail")
                : t(lang, "signupWithEmail")}
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={async () => {
              setAuthLoading(true);
              try {
                await signInWithGoogle();
              } catch (e: any) {
                toast.error(e?.message ?? "Login error");
              } finally {
                setAuthLoading(false);
              }
            }}
            className="mt-4 w-full rounded-xl"
          >
            <Image
              src="/google-logo.png"
              alt="Google"
              width={18}
              height={18}
              className="mr-2"
            />
            {t(lang, "continueWithGoogle")}
          </Button>
        </Card>
      ) : (
        <Card className="p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-5">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              {t(lang, "profile")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center">
              {photoUrl ? (
                <Image
                  src={photoUrl}
                  alt="Profile"
                  width={80}
                  height={80}
                  className="rounded-full border mb-3 object-cover"
                />
              ) : (
                <div className="w-[80px] h-[80px] rounded-full bg-slate-200 flex items-center justify-center mb-3 text-3xl">
                  👤
                </div>
              )}

              <label
                htmlFor="avatar-upload"
                className="cursor-pointer text-sm text-emerald-600 hover:underline font-medium"
              >
                <Upload className="w-4 h-4 inline-block mr-1" />
                {uploading ? t(lang, "uploading") : t(lang, "change_photo")}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) toast.info("Subiendo imagen (simulado en web)");
                }}
              />
            </div>

            <p className="text-sm text-slate-500 uppercase font-semibold">
              {t(lang, "email")}
            </p>
            <p className="text-slate-800 dark:text-slate-200 font-medium">
              {user.email}
            </p>

            <p className="text-sm text-slate-500 uppercase font-semibold mt-3">
              {t(lang, "name")}
            </p>
            {!editName ? (
              <div className="flex justify-between items-center">
                <span>{newName || "-"}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditName(true)}
                >
                  ✏️
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button onClick={handleSaveName} disabled={nameLoading}>
                    {t(lang, "save")}
                  </Button>
                  <Button variant="outline" onClick={() => setEditName(false)}>
                    ✕
                  </Button>
                </div>
              </div>
            )}

            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full rounded-xl mt-4"
            >
              <LogOut className="w-4 h-4 mr-2" /> {t(lang, "logout")}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 🟢 Sección de acciones moved here (antes en modal) */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
   <Button
  variant="outline"
  className="justify-start"
  onClick={() => router.push("/profile/suggest-place")}
>
  <MapPin className="w-4 h-4 mr-2" />
  {t(lang, "suggest_place")}
</Button>


<Button
  variant="outline"
  className="justify-start text-emerald-700"
  onClick={() => router.push("/profile/join-partner")}
>
  <Star className="w-4 h-4 mr-2" />
  {t(lang, "joinAdiPartner")}
</Button>

<Button
  variant="outline"
  className="justify-start"
  onClick={() => {
    const subject = encodeURIComponent(t(lang, "support_email_subject"));
    const body = encodeURIComponent(t(lang, "support_email_body"));
    window.location.href = `mailto:info@mfelizweb.com?subject=${subject}&body=${body}`;
  }}
>
  <MessageSquare className="w-4 h-4 mr-2" />
  {t(lang, "support")}
</Button>



<Button
  variant="outline"
  className="justify-start"
  onClick={async () => {
    const message =
      t(lang, "share_message") + " https://zoqch.app.link/DOWNLOAD-ADI";

    // 🟢 Si el navegador soporta Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: "ADI",
          text: message,
          url: "https://zoqch.app.link/DOWNLOAD-ADI",
        });
      } catch (err) {
        toast.error("No se pudo compartir");
      }
      return;
    }

    // 🔵 Si NO soporta share → copiar al portapapeles
    try {
      await navigator.clipboard.writeText(message);
      toast.success(t(lang, "copied_to_clipboard"));
    } catch (err) {
      toast.error("Error copiando link");
    }
  }}
>
  <Share2 className="w-4 h-4 mr-2" />
  {t(lang, "share")}
</Button>

   {/*}     <Button
          variant="outline"
          onClick={toggleOfflineMode}
          className="justify-start"
        >
          {offlineEnabled ? (
            <>
              <CloudOff className="w-4 h-4 mr-2 text-emerald-600" />
              {t(lang, "offline_mode_active")}
            </>
          ) : (
            <>
              <Cloud className="w-4 h-4 mr-2" />
              {t(lang, "offline_mode")}
            </>
          )}
        </Button>

        */}
        <Button
  variant="outline"
  className="justify-start text-red-600"
  onClick={() => router.push("/profile/delete-account")}
>
  <Trash2 className="w-4 h-4 mr-2" />
  {t(lang, "delete_account")}
</Button>


      </div>

      {/* 🔹 Modal más pequeño con scroll */}
      <Dialog open={menuVisible} onOpenChange={setMenuVisible}>
        <DialogContent className="max-w-xs max-h-[70vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-center text-base font-semibold">
              {t(lang, "account_options")}
            </DialogTitle>
          </DialogHeader>
          <p className="text-center text-sm text-slate-500 mt-2">
            {t(lang, "selectOption")}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
