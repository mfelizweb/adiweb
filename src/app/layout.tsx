import "@/styles/globals.css";
import React from "react";

import {NextIntlClientProvider} from "next-intl";
import {getMessages} from "next-intl/server";

import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { OverlayProvider } from "@/contexts/OverlayContext";
import { StateProvider } from "@/contexts/StateContext";

import GlobalOverlays from "@/contexts/GlobalOverlays";
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";

import GlobalLoader from "@/components/GlobalLoader";
import StoreInstallBanner from "@/components/StoreInstallBanner";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: "Adonde Ir",
  description: "Explora y planifica tus viajes con Adonde Ir",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  // 🔥 Cargar mensajes detectados por el middleware
  const messages = await getMessages();

  return (
    <html lang="es">
      <body className="min-h-screen bg-white text-gray-900">

        {/* 🔥 Obligatorio si usas middleware de next-intl */}
        <NextIntlClientProvider messages={messages}>

          <AuthProvider>
            <OverlayProvider>
              <LanguageProvider>
                <StateProvider>

                  <GlobalLoader />
                  <StoreInstallBanner />
                  <Navbar />

                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {children}
                  </main>

                  <Toaster position="bottom-center" richColors />
                  <GlobalOverlays />

                </StateProvider>
              </LanguageProvider>
            </OverlayProvider>
          </AuthProvider>

          <Analytics />
        </NextIntlClientProvider>

      </body>
    </html>
  );
}
