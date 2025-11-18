 import { ReactNode } from "react";
import { locales, defaultLocale, type Lang } from "@/i18n/config";
import RootLayout from "../layout";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const lang: Lang = locales.includes(locale as Lang)
    ? (locale as Lang)
    : defaultLocale;

  return (
    <html lang={lang}>
      <body>
        <RootLayout>{children}</RootLayout>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
