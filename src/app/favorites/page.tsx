"use client";
export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/config";
import { useAuth } from "@/contexts/AuthContext";
import { FaStar } from "react-icons/fa";

interface Favorite {
  id: string;
  place_id: string;
 places: {
  id: string;
  name: string;
  state: string | null;
  region: string | null;
  image: string | null;
  image1?: string | null;
  image2?: string | null;
  reviews?: { rating: number }[]; 
} | null;

 


}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const { language: lang } = useLanguage();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) fetchFavorites();
  }, [user]);

  async function fetchFavorites() {

    const { data, error } = await supabase
      .from("favorites")
      .select(`
        id,
        place_id,
        places:places!favorites_place_id_fkey (
          id,
          name,
          state,
          region,
          image,
          image1,
          image2
        )
      `)
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });

 
    if (error) {
       return;
    }

   setFavorites(data as unknown as Favorite[]);

  }

  function renderStars(rating: number = 4.5) {
    return (
      <div className="flex items-center gap-1 mt-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <FaStar
            key={i}
            className={i < Math.round(rating) ? "text-yellow-400" : "text-gray-300"}
            size={14}
          />
        ))}
      </div>
    );
  }

return (
  <div className="max-w-5xl mx-auto px-4 py-10 animate-fadeIn">
    <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-8 tracking-tight">
      ⭐ {t(lang, "favorites")}
    </h1>

    {favorites.length === 0 ? (
      <p className="text-center text-gray-500 mt-12 text-lg">
        {t(lang, "noResults")}
      </p>
    ) : (
      <div className="grid sm:grid-cols-2 gap-6">
        {favorites.map((item) => {
          const place = item.places;
          if (!place) return null;

          const img =
            place.image ??
            place.image1 ??
            place.image2 ??
            "/placeholder.jpg";

          const reviews = place.reviews ?? [];
          const rating =
            reviews.length > 0
              ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
              : 0;

          return (
            <div
              key={item.id}
              onClick={() =>
                router.push(`/place/${item.place_id}?lang=${lang}`)
              }
              className="
                group cursor-pointer overflow-hidden rounded-xl bg-white/80 backdrop-blur
                shadow-md hover:shadow-xl transition-all duration-500
                border border-gray-200/40 hover:border-gray-300 transform hover:-translate-y-1
              "
            >
              {/* Imagen */}
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={img}
                  alt={place.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                />
                <div className="absolute top-3 right-3 bg-white/70 backdrop-blur px-3 py-1 text-xs font-medium rounded-full shadow">
                  {place.state}
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-green-700 transition">
                  {place.name}
                </h2>

                <p className="text-sm text-gray-500">{place.region}</p>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-2">
                  <div title={`${reviews.length} reseñas`} className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FaStar
                        key={i}
                        className={
                          i < Math.round(rating)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }
                        size={14}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                   <span className="text-sm text-gray-600">
  {rating > 0 ? rating.toFixed(1) : t(lang, "noReviews")}
</span>

                  </span>
                </div>

                {/* Botón */}
                <button
                  className="mt-4 w-full border border-green-600 text-green-700 bg-white hover:bg-green-50 font-medium text-sm px-4 py-2 rounded-xl transition"
                >
                 {t(lang, "seeMore")}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

}
