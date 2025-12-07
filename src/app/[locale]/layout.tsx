import "@/styles/globals.css";
import type { ReactNode } from "react";

import { locales, defaultLocale, type Lang } from "@/i18n/config";

import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { OverlayProvider } from "@/contexts/OverlayContext";
import { StateProvider } from "@/contexts/StateContext";

import GlobalOverlays from "@/contexts/GlobalOverlays";
import GlobalLoader from "@/components/GlobalLoader";
import StoreInstallBanner from "@/components/StoreInstallBanner";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";

// Generate /en and /es routes
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const locale = params.locale as Lang;
  const lang = locales.includes(locale) ? locale : defaultLocale;

  return (
    <html lang={lang}>
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

        <Analytics />
      </body>
    </html>
  );
}
