import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./src/i18n/config";

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always", // fuerza /en /es explícitamente
});

export const config = {
  matcher: [
    "/",        // solo la homepage
    "/(en|es)/:path*",  // solo rutas con prefijo de idioma
  ],
};
