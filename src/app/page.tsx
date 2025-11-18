"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ExploreHeader, ExploreList, ExploreMap } from "@/components/explore";
import { t, type Lang } from "@/i18n/config";
import { supabase } from "@/lib/supabase";
import { trackEvent } from "@/lib/trackEvent";
import { useStateContext } from "@/contexts/StateContext";
import { useLanguage } from "@/contexts/LanguageContext";

type ViewMode = "list" | "map";

const PAGE_SIZE = 10;

function generateSponsorCard(index: number, region: string) {
  return {
    id: `sponsored-${index}`,
    isSponsored: true,
    image_url:
      index % 2 === 0
        ? "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800"
        : "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800",
    region,
    state: null,
  };
}

function mergeSponsoredEveryN(data: any[], region: string, everyN = 6): any[] {
  const merged = [];
  for (let i = 0; i < data.length; i++) {
    merged.push(data[i]);
    if ((i + 1) % everyN === 0) {
      merged.push(generateSponsorCard(i, region));
    }
  }
  return merged;
}

export default function ExplorePage() {
    const { language: lang } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchInput, setSearchInput] = useState("");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [places, setPlaces] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

 const { region, state } = useStateContext();


  // 📍 Obtener lugares cercanos
  const fetchNearby = async () => {
    if (!navigator.geolocation) {
      alert(t(lang, "not_allowed"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const latRange = 0.1;
        const lngRange = 0.1;

        const minLat = latitude - latRange;
        const maxLat = latitude + latRange;
        const minLng = longitude - lngRange;
        const maxLng = longitude + lngRange;

        setLoading(true);

        const { data, error } = await supabase
          .from("places")
          .select("*")
          .gte("latitude", minLat)
          .lte("latitude", maxLat)
          .gte("longitude", minLng)
          .lte("longitude", maxLng)
          .limit(30);

        if (!error && data) {
          const cleaned = data.map((p) => ({
            ...p,
            image_url: p.image || p.image1 || p.image2 || null,
          }));

          const merged = mergeSponsoredEveryN(cleaned, region);
          setPlaces(merged);
          setPage(0);
          setHasMore(false);

          // 🎯 Track event RPC
          trackEvent({
            event_type: "location_search",
            region,
            state: null,
          });
        } else {
          console.error("❌ Error ubicación:", error);
        }

        setLoading(false);
      },
      (err) => {
        alert("No pudimos obtener tu ubicación.");
        console.error(err);
      },
      { enableHighAccuracy: true }
    );
  };

  // 📦 Cargar lugares paginados
  const fetchPlaces = useCallback(
    async (pageNumber = 0, append = false) => {
      const from = pageNumber * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      if (append) setLoadingMore(true);
      else {
        setLoading(true);
        setHasMore(true);
      }

let query = supabase
  .from("places")
  .select("*")
  .eq("region", region)
  .order("created_at", { ascending: false })
  .range(from, to);

if (state) query = query.eq("state", state);


      if (selectedCat) query = query.eq("main_category", selectedCat);
      if (searchInput)
        query = query.or(
          `name.ilike.%${searchInput}%,descripcion.ilike.%${searchInput}%,descripcion_en.ilike.%${searchInput}%`
        );

      const { data, error } = await query;

      if (!error && data) {
        const cleaned = data.map((p) => ({
          ...p,
          image_url: p.image || p.image1 || p.image2 || null,
        }));

        const merged = mergeSponsoredEveryN(cleaned, region);

        if (append) {
          setPlaces((prev) => [...prev, ...merged]);
          setPage(pageNumber);
        } else {
          setPlaces(merged);
          setPage(0);
        }

        setHasMore(data.length === PAGE_SIZE);
      } else {
        console.error("❌ Supabase error:", error);
        if (!append) setPlaces([]);
        setHasMore(false);
      }

      setLoading(false);
      setLoadingMore(false);
    },
    [searchInput, selectedCat, region]
  );

  useEffect(() => {
    fetchPlaces(0, false);
  }, [fetchPlaces]);

  // 🔍 Búsqueda manual + track event
  const onSubmitSearch = () => {
    trackEvent({
      event_type: "search_performed",
      destination: searchInput || null,
      region,
    });
    fetchPlaces(0, false);
  };

  const loadMore = () => {
    fetchPlaces(page + 1, true);
  };

  // 🧭 Render principal
  return (
    <main className="min-h-screen bg-white">
      <ExploreHeader
        lang={lang}
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        selectedCat={selectedCat}
        setSelectedCat={setSelectedCat}
        onSubmitSearch={onSubmitSearch}
        onLocateMe={fetchNearby}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {viewMode === "list" ? (
          <>
            <ExploreList lang={lang} places={places} />
            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-6 py-2 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50"
                >
                  {loadingMore
                    ? t(lang, "loading")
                    : t(lang, "loadMore")}
                </button>
              </div>
            )}
          </>
        ) : (
          <ExploreMap
            lang={lang}
            places={places.filter((p) => !p.isSponsored)}
          />
        )}
      </section>
    </main>
  );
}
