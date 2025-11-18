"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStateContext } from "@/contexts/StateContext";
import { useOverlay } from "@/contexts/OverlayContext";
import { t } from "@/i18n/config";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SuggestPlacePage() {
  const { user } = useAuth();
  const { language: lang } = useLanguage();
  const { region: ctxRegion, state: ctxState } = useStateContext();
  const { openState } = useOverlay();

  const [region, setRegion] = useState<string | null>(ctxRegion || null);
  const [state, setState] = useState<string | null>(ctxState || null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Validar usuario
  useEffect(() => {
    if (!user) {
      toast.info(t(lang, "login_required"));
      window.history.back();
    }
  }, [user, lang]);

  const handleSelectState = async () => {
    const result = (await openState()) as unknown;
    const selected = result as { region: string; state: string } | null;

    if (selected?.region && selected?.state) {
      setRegion(selected.region);
      setState(selected.state);
    }
  };

  const handleSubmit = async () => {
    if (!user) return toast.info(t(lang, "login_required"));
    if (!region || !state)
      return toast.error(t(lang, "select_location_required"));
    if (!name.trim())
      return toast.error(t(lang, "name_required"));

    try {
      setLoading(true);

      // ⭐ Count suggestions in last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      const { data: recentSuggestions, error: countError } = await supabase
        .from("place_suggestions")
        .select("id", { count: "exact" })
        .eq("user_id", user.id)
        .gte("created_at", oneHourAgo);

      if (countError) {
        console.error(countError);
        toast.error(t(lang, "could_not_send_suggestion"));
        setLoading(false);
        return;
      }

      // ⭐ LIMIT: max 3 per hour
      if ((recentSuggestions?.length ?? 0) >= 3) {
        toast.info(t(lang, "limit_reached_hourly"));
        setLoading(false);
        return;
      }

      // Insertar sugerencia
      const { error } = await supabase.from("place_suggestions").insert([
        {
          user_id: user.id,
          name,
          description,
          region,
          state,
          image_urls: images.length > 0 ? images : null,
        },
      ]);

      if (error) throw error;

      toast.success(t(lang, "thanks_for_suggestion"));
      setName("");
      setDescription("");
      setImages([]);

      router.push("/profile");
    } catch (e) {
      console.error(e);
      toast.error(t(lang, "could_not_send_suggestion"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h1 className="text-2xl font-bold">
            {t(lang, "suggest_place_title")}
          </h1>

          {/* Location */}
          <p className="text-sm font-medium text-gray-700">
            {t(lang, "location")}
          </p>

          <Button
            variant="outline"
            onClick={handleSelectState}
            className="w-full justify-between"
          >
            {region && state
              ? `${state}, ${region}`
              : `🌎 ${t(lang, "select_location")}`}
          </Button>

          {/* Place name */}
          <Input
            placeholder={t(lang, "place_name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Description */}
          <textarea
            className="w-full border border-gray-200 rounded-lg p-3 text-sm min-h-[100px]"
            placeholder={t(lang, "place_description")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Images */}
          <div className="flex flex-wrap gap-3">
            {images.map((img) => (
              <div
                key={img}
                className="relative w-24 h-24 rounded-lg overflow-hidden"
              >
                <Image
                  src={img}
                  alt="preview"
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() =>
                    setImages(images.filter((i) => i !== img))
                  }
                  className="absolute top-1 right-1 bg-black/50 rounded-full p-1 text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {images.length < 4 && (
              <label className="w-24 h-24 border border-emerald-400 rounded-lg flex items-center justify-center cursor-pointer hover:bg-emerald-50 text-emerald-600 text-2xl font-bold">
                ＋
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const newUrls = files.map((f) =>
                      URL.createObjectURL(f)
                    );
                    setImages((prev) =>
                      [...prev, ...newUrls].slice(0, 4)
                    );
                  }}
                />
              </label>
            )}
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t(lang, "loading")}
              </>
            ) : (
              t(lang, "send_suggestion")
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
