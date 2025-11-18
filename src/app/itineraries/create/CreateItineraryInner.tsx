"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/config";
import dayjs from "dayjs";
import { toast } from "sonner";
import Image from "next/image";

export default function CreateItineraryInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  type Lang = "es" | "en";

  const langParam = searchParams.get("lang");
  const lang: Lang =
    langParam === "en" || langParam === "es" ? langParam : "es";

  const { user } = useAuth();
  const { language } = useLanguage();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [days, setDays] = useState<number>(1);
  const [limit, setLimit] = useState<number>(4);
  const [region, setRegion] = useState<string | null>(null);
  const [regions, setRegions] = useState<string[]>([]);
  const [state, setState] = useState<string | null>(null);
  const [states, setStates] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [places, setPlaces] = useState<any[]>([]);
  const [selectedPlaces, setSelectedPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    fetchRegions();
  }, []);

  useEffect(() => {
    fetchLimit();
  }, [days]);

  useEffect(() => {
    if (region) fetchPlaces();
  }, [region, state]);

  async function fetchLimit() {
    const { data } = await supabase
      .from("config_itinerary_limits")
      .select("max_places")
      .eq("days", days)
      .single();
    if (data) setLimit(data.max_places);
  }

  async function fetchRegions() {
    const { data } = await supabase
      .from("places")
      .select("region")
      .not("region", "is", null);
    if (data) {
      const unique = Array.from(new Set(data.map((r) => r.region))).filter(
        Boolean
      );
      setRegions(unique);
    }
  }

  async function fetchStates(region: string) {
    const { data } = await supabase
      .from("places")
      .select("state")
      .eq("region", region)
      .not("state", "is", null);
    if (data) {
      const unique = Array.from(new Set(data.map((r) => r.state))).filter(
        Boolean
      );
      setStates(unique);
    }
  }

  const fetchPlaces = useCallback(async () => {
    if (!region) return;
    setLoading(true);
    let query = supabase
      .from("places")
      .select("id, name, state, main_category, image")
      .eq("region", region)
      .limit(80);
    if (state) query = query.eq("state", state);
    const { data } = await query;
    setLoading(false);
    if (data) setPlaces(data);
  }, [region, state]);

  function togglePlace(place: any) {
    const exists = selectedPlaces.find((p) => p.id === place.id);
    if (exists) {
      setSelectedPlaces(selectedPlaces.filter((p) => p.id !== place.id));
    } else if (selectedPlaces.length < limit) {
      setSelectedPlaces([...selectedPlaces, place]);
    } else {
      toast.error(`${t(lang, "max_places")}: ${limit}`);
    }
  }

  async function handleSave() {
    if (!user) return toast.error(t(lang, "login_required"));
    if (!name.trim()) return toast.error(t(lang, "name_required"));
    if (!region) return toast.error(t(lang, "select_region"));
    if (selectedPlaces.length === 0) return toast.error(t(lang, "no_places"));

    if (startDate && !endDate) return toast.error(t(lang, "choose_end_date"));
    if (!startDate && endDate) return toast.error(t(lang, "choose_start_date"));
    if (startDate && endDate && dayjs(endDate).isBefore(dayjs(startDate)))
      return toast.error(t(lang, "end_after_start"));

    const finalStart = startDate || new Date().toISOString();
    const finalEnd =
      endDate || dayjs(finalStart).add(15, "day").toISOString();

    setSaving(true);

    const { data, error } = await supabase
      .from("itineraries")
      .insert([
        {
          user_id: user.id,
          name,
          region,
          state,
          days,
          start_date: dayjs(finalStart).format("YYYY-MM-DD"),
          end_date: dayjs(finalEnd).format("YYYY-MM-DD"),
          source: "user",
          is_public: isPublic,
        },
      ])
      .select("id")
      .single();

    if (error || !data) {
      toast.error("No se pudo guardar.");
      setSaving(false);
      return;
    }

    const itineraryId = data.id;
    await supabase.from("itinerary_places").insert(
      selectedPlaces.map((p, idx) => ({
        itinerary_id: itineraryId,
        place_id: p.id,
        day: Math.min(
          days,
          1 + Math.floor(idx / Math.ceil(selectedPlaces.length / days))
        ),
        order_index: idx + 1,
      }))
    );

    toast.success(t(lang, "itinerary_created"));
    router.back();
  }

  const next = () => setStep((s) => Math.min(5, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <h1 className="text-center text-gray-500 text-sm mb-6">
        {t(lang, "create_itinerary")} ({step}/5)
      </h1>
 
    </div>
  );
}
