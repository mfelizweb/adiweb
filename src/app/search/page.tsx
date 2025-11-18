"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { SectionHeader } from "@/components/SectionHeader";

interface Place {
  id: string;
  name: string;
  image: string | null;
  region: string | null;
  state: string | null;
  main_category: string | null;
  popularity_score: number | null;
}

export default function SearchPage() {
  const params = useSearchParams();
  const q = params.get("q")?.trim() || "";
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [region] = useState("Dominican Republic"); // región por defecto

  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true);

      let query = supabase
        .from("places")
        .select("id, name, image, region, state, main_category, popularity_score");

      if (q) {
        // 🔍 Si el usuario busca algo
        query = query.or(
          `name.ilike.%${q}%, state.ilike.%${q}%, region.ilike.%${q}%, main_category.ilike.%${q}%`
        );
      } else {
        // 🇩🇴 Por defecto mostrar RD
        query = query.eq("region", region);
      }

      const { data, error } = await query.order("popularity_score", { ascending: false });

      if (error) console.error("Error buscando lugares:", error);
      else setPlaces(data || []);
      setLoading(false);
    };

    fetchPlaces();
  }, [q, region]);

  return (
    <main className="container py-12">
      <SectionHeader
        title={q ? `Resultados para “${q}”` : `Lugares en ${region}`}
        subtitle={q ? "Explora los mejores resultados de tu búsqueda" : "Explora los destinos más visitados"}
      />

      {loading ? (
        <p className="text-center text-foreground/60 py-8">Buscando lugares...</p>
      ) : places.length === 0 ? (
        <p className="text-center text-foreground/60 py-8">No se encontraron resultados.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {places.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl bg-card border border-black/10 shadow-soft hover:shadow-md transition-all overflow-hidden"
            >
              {p.image && (
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-44 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{p.name}</h3>
                {p.state && <p className="text-sm text-foreground/70">{p.state}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
