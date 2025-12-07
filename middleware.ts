// middleware.ts
import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./src/i18n/config";

export default createMiddleware({
  locales,
  defaultLocale,
  // 🔥 IMPORTANTE: sin prefijo en la URL
  localePrefix: "never",
});

export const config = {
  // Esto aplica el middleware solo a rutas "normales"
  matcher: ["/((?!_next|_vercel|favicon.ico|.*\\..*).*)"],
};
