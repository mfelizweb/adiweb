import { ReactNode } from "react";
import { locales, defaultLocale, type Lang } from "@/i18n/config";
import RootLayout from "../layout";

export default function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const lang: Lang = locales.includes(params.locale as Lang)
    ? (params.locale as Lang)
    : defaultLocale;

  return (
    <html lang={lang}>
      <body>
        <RootLayout>{children}</RootLayout>
      </body>
    </html>
  );
}

// ✅ Para que Next.js genere /en y /es automáticamente
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
