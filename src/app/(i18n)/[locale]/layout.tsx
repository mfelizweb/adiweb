import type { ReactNode } from "react";
import { locales, defaultLocale, type Lang } from "@/i18n/config";

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
    <>
      {/* Sobrescribimos lang dinámicamente usando script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang="${lang}";`,
        }}
      />
      {children}
    </>
  );
}
