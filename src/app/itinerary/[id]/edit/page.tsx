"use client";
export const dynamic = "force-dynamic";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/config";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
 

export default function EditItineraryPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { user } = useAuth();
  const { language } = useLanguage();
  const lang = language || "es";
 

  const [step, setStep] = useState(1);
  const [itinerary, setItinerary] = useState<any>(null);
  const [places, setPlaces] = useState<any[]>([]);
  const [selectedPlaces, setSelectedPlaces] = useState<any[]>([]);
  const [currentPlaces, setCurrentPlaces] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [days, setDays] = useState<number>(1);
  const [region, setRegion] = useState<string | null>(null);
  const [stateName, setStateName] = useState<string | null>(null);
  const [maxPlaces, setMaxPlaces] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // --- Límite de lugares ---
  async function fetchLimits(d: number) {
    const { data } = await supabase
      .from("config_itinerary_limits")
      .select("max_places")
      .eq("days", d)
      .maybeSingle();
    setMaxPlaces(data?.max_places || 10);
  }

  // --- Cargar itinerario ---
  async function fetchItinerary() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("itineraries")
        .select("id, name, days, region, user_id")
        .eq("id", id)
        .single();

      if (error || !data) {
        toast.error(t(lang, "could_not_load_itinerary"));
        setLoading(false);
        return;
      }

      if (data.user_id !== user?.id) {
        toast.error(t(lang, "cannot_edit_others_itinerary"));
        router.back();
        return;
      }

      setItinerary(data);
      setName(data.name);
      setDays(data.days);
      setRegion(data.region);
      await fetchLimits(data.days);

      const { data: current } = await supabase
        .from("itinerary_places")
        .select("places(id, name, image, state, region, main_category)")
        .eq("itinerary_id", id);

      const cleaned =
        current?.map((p) =>
          Array.isArray(p.places) ? p.places[0] : p.places
        ) || [];

      setSelectedPlaces(cleaned.map((p) => p.id));
      setCurrentPlaces(cleaned);

      const inferredRegion =
        cleaned.find((p) => p?.region)?.region || data.region;
      const inferredState = cleaned.find((p) => p?.state)?.state || null;
      setRegion(inferredRegion || null);
      setStateName(inferredState || null);

      const usedPlaceIds = cleaned.map((p) => p.id);
      let query = supabase
        .from("places")
        .select("id, name, image, state, region, main_category")
        .not("id", "in", `(${usedPlaceIds.join(",") || "000"})`)
        .limit(200);

      if (inferredState) query = query.eq("state", inferredState);
      else query = query.eq("region", inferredRegion);

      const { data: available } = await query;
      setPlaces(available || []);
    } catch (err: any) {
      toast.error(t(lang, "could_not_load_itinerary"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchItinerary();
  }, [id]);

  useEffect(() => {
    fetchLimits(days);
  }, [days]);

  // --- Alternar selección ---
  function togglePlace(place: any) {
    const isSelected = selectedPlaces.includes(place.id);
    if (isSelected) {
      setSelectedPlaces(selectedPlaces.filter((pid) => pid !== place.id));
    } else {
      if (maxPlaces && selectedPlaces.length >= maxPlaces) {
        toast.error(`${t(lang, "max_places_allowed")} ${maxPlaces}`);
        return;
      }
      setSelectedPlaces([...selectedPlaces, place.id]);
    }
  }

  // --- Guardar cambios ---
  async function handleSave() {
    if (!user?.id) {
      toast.error(t(lang, "login_required"));
      return;
    }
    if (!name.trim()) {
      toast.error(t(lang, "name_required"));
      return;
    }

    setSaving(true);
    const { error: updateErr } = await supabase
      .from("itineraries")
      .update({
        name,
        days,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (updateErr) {
      toast.error(t(lang, "could_not_update_itinerary"));
      setSaving(false);
      return;
    }

    await supabase.from("itinerary_places").delete().eq("itinerary_id", id);
    const newPlaces = selectedPlaces.map((pid, idx) => ({
      itinerary_id: id,
      place_id: pid,
      day: Math.min(days, 1 + Math.floor(idx / Math.ceil(selectedPlaces.length / days))),
      order_index: idx + 1,
    }));
    await supabase.from("itinerary_places").insert(newPlaces);

    toast.success(t(lang, "itinerary_updated_successfully"));
    setSaving(false);
 
    router.back();
  }

  const next = () => setStep((s) => Math.min(3, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  if (loading)
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
      <h2 className="text-center text-gray-600 mb-4">
        {t(lang, "edit_itinerary")} ({step}/3)
      </h2>

      {step === 1 && (
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
          <h3 className="text-xl font-semibold text-emerald-600 mb-4">
            {t(lang, "edit_name_question")}
          </h3>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t(lang, "enter_name")}
            className="mb-4"
          />
          <Button onClick={next} className="w-full bg-emerald-600 hover:bg-emerald-700">
            {t(lang, "continue")}
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
          <h3 className="text-xl font-semibold text-emerald-600 mb-4">
            {t(lang, "edit_days_question")}
          </h3>
          <div className="flex flex-wrap justify-center gap-2 mb-3">
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                  days === d
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-emerald-50"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <p className="text-gray-700 mt-2">
            {stateName
              ? `${t(lang, "state")}: `
              : `${t(lang, "region")}: `}
            <span className="text-emerald-600 font-semibold">
              {stateName || region || t(lang, "unknown")}
            </span>
          </p>

          <div className="mt-4 flex flex-col sm:flex-row justify-center gap-3">
            <Button
              variant="outline"
              onClick={prev}
              className="border-gray-300 text-gray-700"
            >
              {t(lang, "back")}
            </Button>
            <Button onClick={next} className="bg-emerald-600 hover:bg-emerald-700">
              {t(lang, "continue")}
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-xl font-semibold text-emerald-600 mb-4 text-center">
            {t(lang, "edit_places_question")}
          </h3>

          {currentPlaces.length > 0 && (
            <div className="mb-6">
              <h4 className="text-emerald-600 font-semibold mb-3">
                {t(lang, "current_itinerary_places")}
              </h4>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {currentPlaces.map((item) => (
                  <div
                    key={item.id}
                    className="relative w-32 shrink-0 bg-white border border-gray-200 rounded-xl p-2 shadow-sm"
                  >
                    <Image
                      src={
                        item.image ||
                        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"
                      }
                      alt={item.name}
                      width={120}
                      height={80}
                      className="rounded-lg object-cover w-full h-20"
                    />
                    <p className="text-xs font-semibold text-center mt-2 text-gray-800 truncate">
                      {item.name}
                    </p>
                    <button
                      onClick={() => {
                        setSelectedPlaces(selectedPlaces.filter((pid) => pid !== item.id));
                        setCurrentPlaces(currentPlaces.filter((p) => p.id !== item.id));
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <h4 className="text-emerald-600 font-semibold mb-3">
            {t(lang, "available_places")}
          </h4>

          {places.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center text-gray-600">
              {t(lang, "no_more_places_in_area")}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {places.map((item) => {
                const selected = selectedPlaces.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => togglePlace(item)}
                    className={`cursor-pointer border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all ${
                      selected
                        ? "border-emerald-600 bg-emerald-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <Image
                      src={
                        item.image ||
                        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"
                      }
                      alt={item.name}
                      width={300}
                      height={180}
                      className="object-cover w-full h-40"
                    />
                    <div className="p-3 text-center">
                      <p className="font-semibold text-gray-800 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.state ? `${item.state} • ` : ""}
                        {item.main_category}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto"
            >
              {saving ? t(lang, "saving") + "..." : t(lang, "save_changes")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
