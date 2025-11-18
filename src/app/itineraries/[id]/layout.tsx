import { supabase } from "@/lib/supabase";

export async function generateMetadata({ params }: any) {
  const { id } = params;

  // Obtener itinerario
  const { data: itinerary } = await supabase
    .from("itineraries")
    .select("id, title, title_en, description, description_en, cover_image, days, is_public, state, region")
    .eq("id", id)
    .maybeSingle();

  if (!itinerary) {
    return {
      title: "Itinerario no encontrado — Adonde Ir",
      description: "Este itinerario no existe o fue removido.",
    };
  }

  // Imagen principal
  const image = itinerary.cover_image || "/placeholder.jpg";

  // Descripción en idiomas (usando tus columnas)
  const descES =
    itinerary.description ||
    "Descubre este itinerario turístico en Adonde Ir.";

  const descEN =
    itinerary.description_en ||
    itinerary.description ||
    "Explore this travel itinerary on Adonde Ir.";

  const titleES = itinerary.title;
  const titleEN = itinerary.title_en || itinerary.title;

  return {
    title: `${titleES} — Adonde Ir`,
    description: descES.slice(0, 160),

    alternates: {
      canonical: `https://adondeir.net/itinerary/${id}`,
      languages: {
        es: `https://adondeir.net/es/itinerary/${id}`,
        en: `https://adondeir.net/en/itinerary/${id}`,
      },
    },

    openGraph: {
      title: `${titleES} — Adonde Ir`,
      description: descES.slice(0, 160),
      url: `https://adondeir.net/itinerary/${id}`,
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
      title: titleEN,
      description: descEN.slice(0, 160),
      images: [image],
    },
  };
}

export default function ItineraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
