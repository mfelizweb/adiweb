import { ReactNode } from "react";
import { locales, defaultLocale } from "@/i18n/config";

export default function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const lang = locales.includes(params.locale as any)
    ? params.locale
    : defaultLocale;

  return (
    <html lang={lang}>
      <body>{children}</body>
    </html>
  );
}
