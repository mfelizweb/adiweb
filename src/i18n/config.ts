import en from "./messages/en.json";
import es from "./messages/es.json";

// ✅ Idiomas soportados
export const locales = ["es", "en"] as const;
export const defaultLocale = "en";

// ✅ Diccionario de mensajes (sin "as const" aquí)
export const messages = {
  en,
  es,
};

// ✅ Tipo de idioma
export type Lang = keyof typeof messages;

// ✅ Tipo base de claves (para autocompletado opcional)
export type MessageKey = keyof typeof en;

// ✅ Función de traducción con fallback y soporte para claves dinámicas
export function t(lang: Lang, key: string): string {
  const dict = messages[lang] as Record<string, any>;
  const defaultDict = messages[defaultLocale] as Record<string, any>;

  // 1️⃣ Buscar coincidencia exacta primero (para "categories.all")
  if (dict[key]) return dict[key];
  if (defaultDict[key]) return defaultDict[key];

  // 2️⃣ Si no existe exacta, intentar resolver por niveles ("categories.all" => { categories: { all: "..." } })
  const getNested = (obj: any, path: string): any =>
    path.split(".").reduce((acc, part) => acc?.[part], obj);

  return (
    getNested(dict, key) ??
    getNested(defaultDict, key) ??
    key
  );
}
