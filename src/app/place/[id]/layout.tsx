import { supabase } from "@/lib/supabase";

export async function generateMetadata({ params }: any) {
  const { id } = params;

  // Cargar información del lugar desde Supabase
  const { data: place } = await supabase
    .from("places")
    .select("name, descripcion, descripcion_en, image, image1, image2, state, region")
    .eq("id", id)
    .maybeSingle();

  if (!place) {
    return {
      title: "Lugar no encontrado — Adonde Ir",
      description: "Este lugar no existe o fue removido.",
    };
  }

  // imágenes correctas
  const images = [place.image, place.image1, place.image2].filter(Boolean);
  const image = images[0] || "/placeholder.jpg";

  // descripción en español e inglés (usando tus columnas)
  const descriptionES =
    place.descripcion || "Descubre este lugar turístico con Adonde Ir.";

  const descriptionEN =
    place.descripcion_en ||
    place.descripcion ||
    "Discover this tourist place with Adonde Ir.";

  return {
    title: `${place.name} — Adonde Ir`,
    description: descriptionES.slice(0, 160),

    alternates: {
      canonical: `https://adondeir.net/place/${id}`,
      languages: {
        "es": `https://adondeir.net/es/place/${id}`,
        "en": `https://adondeir.net/en/place/${id}`,
      },
    },

    openGraph: {
      title: `${place.name} — Adonde Ir`,
      description: descriptionES.slice(0, 160),
      url: `https://adondeir.net/place/${id}`,
      siteName: "Adonde Ir",
      type: "article",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
        },
      ],
      locale: "es_ES",
      alternateLocale: "en_US",
    },

    twitter: {
      card: "summary_large_image",
      title: place.name,
      description: descriptionEN.slice(0, 160),
      images: [image],
    },
  };
}

export default function PlaceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
    