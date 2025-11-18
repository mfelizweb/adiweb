"use client";

import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function DeleteAccountPage() {
  const [loading, setLoading] = useState(false);
  const { language } = useLanguage();
  const lang = (language as "en" | "es") ?? "en";

  const t = {
    title: lang === "es" ? "Eliminar tu cuenta" : "Delete Your Account",
    text:
      lang === "es"
        ? "Esto eliminará permanentemente tu cuenta y todos tus datos. Esta acción no se puede deshacer."
        : "This will permanently delete your account and all associated data. This action cannot be undone.",
    confirm:
      lang === "es"
        ? "¿Seguro que deseas eliminar tu cuenta?"
        : "Are you sure you want to delete your account?",
    deleting: lang === "es" ? "Eliminando..." : "Deleting...",
    btn: lang === "es" ? "Eliminar mi cuenta" : "Delete My Account",
    success: lang === "es" ? "Cuenta eliminada correctamente" : "Account deleted successfully",
    error: lang === "es" ? "Error al eliminar la cuenta." : "Failed to delete account.",
  };

  const handleDelete = async () => {
    if (!confirm(t.confirm)) return;
    setLoading(true);
    try {
      const { error } = await supabase.rpc("delete_my_account");
      if (error) throw error;
      await supabase.auth.signOut();
      toast.success(t.success);
      window.location.href = "/";
    } catch (e: any) {
      console.error(e);
      toast.error(t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h1 className="text-2xl font-bold text-red-600">{t.title}</h1>
          <p className="text-gray-700 text-sm">{t.text}</p>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="w-full"
          >
            {loading ? t.deleting : t.btn}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
