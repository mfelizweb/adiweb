"use client";

import React, { useEffect, useState } from "react";
 import { SectionHeader } from "./SectionHeader";
import { supabase } from "@/lib/supabase";

interface Tour {
  id: string;
  title: string;
  price: number;
  rating: number;
  image_url?: string | null;
}

export function ToursGrid() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("tours") // 👈 nombre de la tabla que me mencionaste
        .select("id, title, price, rating, image_url")
        .order("rating", { ascending: false })
        .limit(9);

      if (error) console.error("Error cargando tours:", error);
      else setTours(data || []);
      setLoading(false);
    };

    fetchTours();
  }, []);

  return (
    <section className="container py-12">
      <SectionHeader
        title="Tours destacados"
        subtitle="Actividades populares seleccionadas para ti"
      />

      {loading ? (
        <p className="text-center text-foreground/60 py-8">Cargando tours...</p>
      ) : tours.length === 0 ? (
        <p className="text-center text-foreground/60 py-8">No hay tours disponibles.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {tours.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl bg-card border border-black/10 p-4 shadow-soft hover:shadow-md transition-all"
            >
              {t.image_url && (
                <img
                  src={t.image_url}
                  alt={t.title}
                  className="rounded-xl w-full h-40 object-cover mb-3"
                />
              )}
              <h3 className="font-semibold text-lg text-foreground/90 mb-2">{t.title}</h3>
              <p className="text-sm text-foreground/70">⭐ {t.rating.toFixed(1)} / 5</p>
              <p className="text-primary font-bold mt-2">Desde ${t.price}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
