"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { SectionHeader } from "./SectionHeader";
import { t, type Lang } from "@/i18n/config";

interface Place {
  id: string;
  name: string;
  image: string | null;
  region: string | null;
  state: string | null;
  main_category: string | null;
  popularity_score: number | null;
}

interface DestinosGridProps {
  region?: string;
  lang?: Lang;
}

export function DestinosGrid({
  region = "Dominican Republic",
  lang = "es",
}: DestinosGridProps) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("places")
        .select("id, name, image, region, state, main_category, popularity_score")
        .eq("region", region)
        .order("popularity_score", { ascending: false })
        .limit(9);

      if (error) console.error("❌ Error cargando lugares:", error);
      else setPlaces(data || []);
      setLoading(false);
    };

    fetchPlaces();
  }, [region]);

  return (
    <section className="container py-12">
      <SectionHeader
        title={`${t(lang, "destinations_in")} ${region}`}
        subtitle={t(lang, "explore_most_visited")}
      />

      {loading ? (
        <p className="text-center text-foreground/60 py-8">
          {t(lang, "loading_destinations")}
        </p>
      ) : places.length === 0 ? (
        <p className="text-center text-foreground/60 py-8">
          {t(lang, "no_places_found")}
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {places.map((p) => (
            <Link href={`/place/${p.id}`} key={p.id}>
              <div className="rounded-2xl bg-card border border-black/10 shadow-soft hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden cursor-pointer">
                {p.image && (
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-44 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{p.name}</h3>
                  {p.state && (
                    <p className="text-sm text-foreground/70">{p.state}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
