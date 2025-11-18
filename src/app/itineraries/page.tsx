"use client";
 "use client";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { t } from "@/i18n/config";
import { useAuth } from "@/contexts/AuthContext";
import { useStateContext } from "@/contexts/StateContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { IoPricetagOutline, IoCreateOutline, IoEyeOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/trackEvent";

/* ---------- TYPES ---------- */
type Itinerary = {
  id: string;
  name: string;
  image_url?: string;
  start_date?: string | null;
  end_date?: string | null;
  is_public?: boolean;
  state?: string | null;
  days?: number;
  active?: boolean;
  source: "user" | "adi" | "partner" | "community";
  region?: string | null;
  profiles?: { name?: string | null };
};

type SponsoredCard = {
  id: string;
  isSponsored: true;
  kind: "hotel" | "restaurant";
  region: string | null;
  state?: string | null;
};

type SharedItinerary = Itinerary & {
  shared_permission?: "view" | "edit";
  shared_by_name?: string | null;
};

/* ---------- COMPONENT ---------- */
export default function ItinerariesPage() {
  const [segment, setSegment] = useState<"mine" | "adi" | "community">("adi");
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(false);
  const [mineView, setMineView] = useState<"own" | "shared">("own");
  const [sharedItineraries, setSharedItineraries] = useState<SharedItinerary[]>([]);
  const [loadingShared, setLoadingShared] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const router = useRouter();

  const { language: lang } = useLanguage();
  const { user } = useAuth();
  const { region, state } = useStateContext();

  const PAGE_SIZE = 6;
  const fetchingRef = useRef(false);

  /* ---------- HELPERS ---------- */
  const shuffleArray = <T,>(array: T[]): T[] =>
    array
      .map((item) => ({ item, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ item }) => item);

  async function fetchImageForState(
    selectedState: string | null,
    selectedRegion?: string | null
  ): Promise<string> {
    let q = supabase.from("places").select("image").limit(1);
    if (selectedState) q = q.eq("state", selectedState);
    else if (selectedRegion) q = q.eq("region", selectedRegion);
    else
      return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800";
    const { data } = await q;
    if (!data || !data[0]?.image)
      return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800";
    return data[0].image;
  }

  /* ---------- FETCH ITINERARIES ---------- */
  async function fetchItineraries(pageNumber = 0) {
    try {
      if (pageNumber === 0) {
        setLoading(true);
        setHasMore(true);
      } else {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
      }

      const from = pageNumber * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from("itineraries")
        .select(
          "id, name, days, region, state, start_date, end_date, is_public, active, source, profiles(name)"
        )
        .order("created_at", { ascending: false })
        .range(from, to);

      if (segment === "mine") {
        if (!user?.id) {
          setItineraries([]);
          setLoading(false);
          return;
        }
        query = query.eq("user_id", user.id).eq("source", "user");
      } 
      
      else if (segment === "adi") {
        query = query.in("source", ["adi", "partner"]).eq("active", true);
      } 
      else if (segment === "community") {
        query = query.eq("is_public", true).eq("source", "user");
        if (user?.id) query = query.neq("user_id", user.id);
      }

      if (segment !== "mine") {
        if (region) query = query.eq("region", region);
        if (state) query = query.eq("state", state);
      }

      const { data, error } = await query;
      if (error) {
        console.log("❌ fetchItineraries error:", error.message);
        setLoading(false);
        return;
      }

      let withImages = await Promise.all(
        (data || []).map(async (it: any) => {
          const img = await fetchImageForState(it.state, it.region);
          return { ...it, image_url: img };
        })
      );
      withImages = shuffleArray(withImages);

      if (pageNumber === 0) setItineraries(withImages);
      else setItineraries((prev) => [...prev, ...withImages]);

      setHasMore((data || []).length === PAGE_SIZE);
      setPage(pageNumber);
    } catch (err) {
      console.log("⚠️ Error general en fetchItineraries:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  /* ---------- FETCH SHARED ---------- */
  async function fetchSharedItineraries() {
    if (!user?.id) return;
    try {
      setLoadingShared(true);
      const { data, error } = await supabase
        .from("itinerary_collaborators")
        .select(`
          permission,
          added_by,
          itineraries!itinerary_collaborators_itinerary_id_fkey (
            id, name, days, region, state, start_date, end_date, is_public, active, source,
            profiles ( name )
          )
        `)
        .eq("user_id", user.id);

      if (error) {
        console.log("❌ fetchSharedItineraries error:", error.message);
        return;
      }

      const flattened = (data || [])
        .map((row: any) => {
          const it = row.itineraries;
          if (!it) return null;
          return {
            ...it,
            shared_permission: row.permission,
            shared_by_name: row.itineraries?.profiles?.name ?? null,
          } as SharedItinerary;
        })
        .filter(Boolean) as SharedItinerary[];

      const withImages = await Promise.all(
        flattened.map(async (it) => {
          const img = await fetchImageForState(it.state ?? null, it.region ?? null);
          return { ...it, image_url: img };
        })
      );

      setSharedItineraries(withImages);
    } catch (err) {
      console.log("⚠️ Error general en fetchSharedItineraries:", err);
    } finally {
      setLoadingShared(false);
    }
  }

  /* ---------- EFFECTS ---------- */
  useEffect(() => {
    fetchItineraries(0);
  }, [segment, region, state, user?.id]);

  useEffect(() => {
    if (segment === "mine") fetchSharedItineraries();
  }, [segment, user?.id]);

  /* ---------- SCROLL INFINITE WEB ---------- */
  useEffect(() => {
    const handleScroll = async () => {
      if (fetchingRef.current) return;
      const bottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
      if (bottom && hasMore && !loading && !loadingMore) {
        fetchingRef.current = true;
        await fetchItineraries(page + 1);
        fetchingRef.current = false;
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page, hasMore, loading, loadingMore]);

  /* ---------- DISPLAY + SPONSORED ---------- */
  const displayData = useMemo<(Itinerary | SponsoredCard)[]>(() => {
    if (segment !== "adi") return itineraries;
    const merged: (Itinerary | SponsoredCard)[] = [];
    let count = 0;
    for (const it of itineraries) {
      merged.push(it);
      count++;
      if (count % 5 === 0) {
        merged.push({
          id: `sponsored-${count}`,
          isSponsored: true,
          kind: count % 10 === 0 ? "hotel" : "restaurant",
          region: region ?? null,
          state: state || null,
        });
      }
    }
    return merged;
  }, [segment, itineraries, region, state]);

  const listData =
    segment === "mine"
      ? mineView === "own"
        ? displayData
        : sharedItineraries
      : displayData;

  /* ---------- RENDER ---------- */
  return (
    <div className="max-w-6xl mx-auto px-4 py-8  min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-900">
        {t(lang, "itineraries")}
      </h1>

      {/* Segmentos */}
      <div className="flex justify-center bg-gray-200 rounded-lg p-1 mb-6">
        {[
          { key: "mine", label: t(lang, "my_itineraries") },
          { key: "adi", label: t(lang, "recommended") },
          { key: "community", label: t(lang, "community") },
        ].map((seg) => (
          <button
            key={seg.key}
            onClick={async () => {
              setSegment(seg.key as any);
              await trackEvent({
                user_id: user?.id || null,
                event_type: "segment_change",
                destination: seg.key,
              });
            }}
            className={`flex-1 py-2 rounded-md font-medium transition-all ${
              segment === seg.key
                ? "bg-emerald-600 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {seg.label}
          </button>
        ))}
      </div>

      {/* Crear */}
      {segment === "mine" && user && (
        <div className="flex justify-center mb-6">
          <button
            onClick={async () => {
              await trackEvent({
                user_id: user?.id || null,
                event_type: "itinerary_create_click",
                destination: "CreateItinerary",
                region,
                state,
              });
              router.push("/itineraries/create");
            }}
            className="px-6 py-2 rounded-lg bg-emerald-600 text-white font-semibold shadow hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            ➕ {t(lang, "create_itinerary")}
          </button>
        </div>
      )}

      {/* Subsegmentos */}
      {segment === "mine" && (
        <div className="flex justify-center bg-gray-100 rounded-lg p-1 mb-6">
          {[
            { key: "own", label: t(lang, "my_itineraries") },
            { key: "shared", label: t(lang, "shared_with_me") },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setMineView(s.key as any)}
              className={`flex-1 py-2 rounded-md font-medium transition-all ${
                mineView === s.key
                  ? "bg-emerald-600 text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-600 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listData.length === 0 && (
            <p className="text-center text-gray-500 col-span-full mt-8">
              {t(lang, "no_places")}
            </p>
          )}

          {listData.map((item: any) => {
            const img =
              item.image_url ||
              "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800";

            if (item.isSponsored) {
              const title =
                item.kind === "hotel"
                  ? t(lang, "sponsored_hotels")
                  : t(lang, "sponsored_restaurants");
              return (
                <div
                  key={item.id}
                  onClick={() =>
                    window.open("https://www.getyourguide.com", "_blank")
                  }
                  className="cursor-pointer rounded-2xl border border-emerald-600 overflow-hidden bg-white hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                >
                  <Image
                    src={img}
                    alt="sponsored"
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <IoPricetagOutline className="text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-600 uppercase">
                        {t(lang, "sponsored")}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
                    <p className="text-sm text-gray-500">
                      {t(lang, "explore_paid_options")}
                    </p>
                  </div>
                </div>
              );
            }

            const it = item as Itinerary;
            const isSharedMode = segment === "mine" && mineView === "shared";
            const sharedPerm = (it as any)?.shared_permission;
            const sharedByName = (it as any)?.shared_by_name ?? null;

            return (
              <div
                key={it.id}
                onClick={async () => {
                  await trackEvent({
                    user_id: user?.id || null,
                    event_type: "itinerary_open",
                    itinerary_id: it.id,
                    place_name: it.name,
                    region: it.region,
                    state: it.state,
                  });
                  router.push(`/itineraries/${it.id}?lang=${lang}`);
                }}
                className="cursor-pointer rounded-2xl bg-white shadow hover:shadow-xl hover:scale-[1.02] overflow-hidden transition-all duration-200"
              >
                <Image
                  src={img}
                  alt={it.name}
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900">{it.name}</h3>
                  {it.days && (
                    <p className="text-sm text-gray-600">
                      {it.days} {t(lang, "days")}
                    </p>
                  )}
                  {it.start_date && (
                    <p className="text-xs text-gray-500 mt-1">
                      {it.start_date} → {it.end_date}
                    </p>
                  )}
                  <p className="text-sm text-emerald-600 font-medium mt-2">
                    {isSharedMode
                      ? `${t(lang, "shared_by")} ${sharedByName || t(lang, "anonymous")}`
                      : `${t(lang, "by")} ${
                          it.source === "adi"
                            ? "ADI"
                            : it.source === "partner"
                            ? "Partner"
                            : it.profiles?.name || t(lang, "anonymous")
                        }`}
                  </p>

                  {isSharedMode && (
                    <div
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold mt-2 ${
                        sharedPerm === "edit"
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-400 text-white"
                      }`}
                    >
                      {sharedPerm === "edit" ? (
                        <IoCreateOutline className="mr-1" />
                      ) : (
                        <IoEyeOutline className="mr-1" />
                      )}
                      {sharedPerm === "edit"
                        ? t(lang, "can_edit")
                        : t(lang, "view_only")}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {loadingMore && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-600 border-t-transparent"></div>
        </div>
      )}
    </div>
  );
}
