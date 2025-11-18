"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Versión web de usePushNotifications:
 * - Usa la Notification API del navegador
 * - Mantiene la misma firma y lógica base
 * - Guarda un "token simulado" por ahora (puedes cambiarlo por FCM Web si luego integras Firebase Cloud Messaging)
 */
export function usePushNotifications(userId?: string) {
  useEffect(() => {
    async function register() {
      try {
        if (typeof window === "undefined" || !("Notification" in window)) {
          console.log("🔕 Notificaciones no soportadas en este navegador.");
          return;
        }

        // 1️⃣ Solicitar permiso al usuario
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.log("🚫 Permiso de notificaciones denegado.");
          return;
        }

        // 2️⃣ Crear una "clave simulada" (más adelante podrás usar FCM o OneSignal)
        const fakeToken = `web-${navigator.userAgent}-${Date.now()}`;

        // 3️⃣ Guardar token en Supabase
        if (userId) {
          await supabase.from("push_tokens").upsert({
            user_id: userId,
            token: fakeToken,
            platform: "Web",
            device: navigator.platform,
          });
        }

        console.log("✅ Notificaciones web registradas correctamente.");
      } catch (err) {
        console.error("❌ Error al registrar notificaciones web:", err);
      }
    }

    register();
  }, [userId]);
}
