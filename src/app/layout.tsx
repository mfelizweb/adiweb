import "@/styles/globals.css";

import React from "react";
 
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { OverlayProvider } from "@/contexts/OverlayContext";
import { StateProvider } from "@/contexts/StateContext";
import GlobalOverlays from "@/contexts/GlobalOverlays";
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";

import GlobalLoader from "@/components/GlobalLoader";  
import StoreInstallBanner from "@/components/StoreInstallBanner";

export const metadata = {
  title: "Adonde Ir",
  description: "Explora y planifica tus viajes con Adonde Ir",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-white text-gray-900">
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
      </body>
    </html>
  );
}
