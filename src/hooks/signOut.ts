"use client";

import { supabase } from "@/lib/supabase";
// import { logOutRevenueCat } from "@/lib/revenuecat";

/**
 * Cierra la sesión del usuario tanto en Supabase como en RevenueCat (si aplica).
 * Mantiene la misma firma que en móvil.
 */
export const signOut = async () => {
  try {
    await supabase.auth.signOut();

    // Si en el futuro integras RevenueCat Web SDK, descomenta esto:
    // await logOutRevenueCat();

    console.log("✅ Sesión cerrada correctamente.");
  } catch (error) {
    console.error("❌ Error al cerrar sesión:", error);
  }
};
