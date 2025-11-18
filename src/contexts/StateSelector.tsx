"use client";

import React, { useState, useMemo } from "react";
import { useStateContext } from "@/contexts/StateContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, type Lang } from "@/i18n/config";
import { Search, X } from "lucide-react";

export default function StateSelector({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { region, regions, states, selectRegion, selectState, loading } =
    useStateContext();
  const { language: lang } = useLanguage();

  const [step, setStep] = useState<"region" | "state">("region");
  const [selectedRegion, setSelectedRegion] = useState<string | null>(region);
  const [query, setQuery] = useState("");

  const handleSelectRegion = async (r: string) => {
    await selectRegion(r);
    setSelectedRegion(r);
    setStep("state");
    setQuery("");
  };

  const handleSelectState = async (s: string | null) => {
    await selectState(s);
    onClose();
    setStep("region");
    setQuery("");
  };

  const filteredRegions = useMemo(
    () =>
      regions.filter((r) =>
        r.toLowerCase().includes(query.toLowerCase().trim())
      ),
    [regions, query]
  );

  const filteredStates = useMemo(
    () =>
      states.filter((s) =>
        s.toLowerCase().includes(query.toLowerCase().trim())
      ),
    [states, query]
  );

if (!visible) return null;

return (
  <div className=" w-full">
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-slate-700 max-h-[85vh] flex flex-col">

      {/* Header */}
      <div className="flex justify-between items-center px-5 py-4 border-b dark:border-slate-700 shrink-0">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100">
          {step === "region"
            ? t(lang, "choose_region")
            : `${t(lang, "choose_state_optional")} - ${selectedRegion}`}
        </h2>
  
      </div>

      {/* Search */}
      <div className="p-4 border-b dark:border-slate-700 flex items-center gap-2 shrink-0">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder={t(lang, "search")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 outline-none bg-transparent text-sm text-slate-700 dark:text-slate-200 placeholder-gray-400"
        />
        {query && (
          <button onClick={() => setQuery("")}>
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* LISTA SCROLLEABLE */}
      <div className="overflow-y-auto px-4 py-3 flex-1">
        {step === "region" && (
          <div className="space-y-2">
            {filteredRegions.map((r) => (
              <button
                key={r}
                onClick={() => handleSelectRegion(r)}
                className={`block w-full text-left py-3 px-3 rounded-md border transition-all ${
                  r === region
                    ? "border-emerald-500 bg-emerald-50 text-emerald-600 font-semibold dark:bg-emerald-900/20"
                    : "border-gray-200 hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-800"
                }`}
              >
                🌍 {r}
              </button>
            ))}
          </div>
        )}

        {step === "state" && (
          <div className="space-y-2">
            <button
              onClick={() => handleSelectState(null)}
              className="block w-full text-left py-3 px-3 rounded-md border border-gray-200 hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              🌎 {t(lang, "all_places_in")} {selectedRegion}
            </button>

            {filteredStates.map((s) => (
              <button
                key={s}
                onClick={() => handleSelectState(s)}
                className="block w-full text-left py-3 px-3 rounded-md border border-gray-200 hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between p-4 border-t dark:border-slate-700 shrink-0">
        {step === "state" ? (
          <button
            onClick={() => {
              setStep("region");
              setQuery("");
            }}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-sm font-medium"
          >
            ← {t(lang, "back")}
          </button>
        ) : (
          <div />
        )}
        <button
          onClick={onClose}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium"
        >
          {t(lang, "close")}
        </button>
      </div>
    </div>
  </div>
);

}
