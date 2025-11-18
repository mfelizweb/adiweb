"use client";

import React from "react";
import { t, type Lang } from "@/i18n/config";
import { Search, Map, Grid2x2 } from "lucide-react";

type ViewMode = "list" | "map";

const CATEGORY_MAP = [
  { key: "all", icon: "✨", value: null },
  { key: "waters", icon: "💧", value: "river" },
  { key: "tours", icon: "🗺️", value: "tour" },
  { key: "restaurants", icon: "🍽️", value: "food" },
  { key: "hiking", icon: "🥾", value: "hiking" },
  { key: "hotels", icon: "🏨", value: "hotel" }
];



interface Props {
  lang: Lang;
  brandKey?: string;
  searchPlaceholderKey?: string;
  viewMode: ViewMode;
  setViewMode: (m: ViewMode) => void;
  searchInput: string;
  setSearchInput: (v: string) => void;
  selectedCat: string | null;
  setSelectedCat: (v: string | null) => void;
  onSubmitSearch: () => void;
  onLocateMe?: () => void;
}

export default function ExploreHeader({
  lang,
  brandKey = "brand",
  searchPlaceholderKey = "searchPlaceholder",
  viewMode,
  setViewMode,
  searchInput,
  setSearchInput,
  selectedCat,
  setSelectedCat,
  onSubmitSearch,
  onLocateMe
}: Props) {
  return (
    <div className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-gray-100">
      {/* 🔹 Top bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
     
        <button
          onClick={() => setViewMode(viewMode === "list" ? "map" : "list")}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-semibold"
        >
          {viewMode === "list" ? <Map size={18} /> : <Grid2x2 size={18} />}
          <span>
            {viewMode === "list"
              ? t(lang, "map") ?? "Mapa"
              : t(lang, "list") ?? "Lista"}
          </span>
        </button>
      </div>

      {/* 🔹 Search bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3">
        <div className="flex items-center gap-2 bg-white border border-emerald-400 rounded-full px-4 py-2 shadow-sm">
          <Search className="text-emerald-500" size={18} />
          <input
            type="text"
            placeholder={t(lang, searchPlaceholderKey)}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => (e.key === "Enter" ? onSubmitSearch() : null)}
            className="flex-1 outline-none text-gray-700"
          />
          {!!searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="text-gray-400 hover:text-gray-600 text-sm px-2"
              aria-label="clear"
            >
              ×
            </button>
          )}
          <button
            onClick={onSubmitSearch}
            className="px-4 py-1.5 rounded-full bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700"
          >
            {t(lang, "search") ?? "Buscar"}
          </button>
        </div>
      </div>

      {/* 🔹 Categories */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-none py-1">
            {CATEGORY_MAP.map((c) => {
              const active = selectedCat === (c.value ?? null);
              return (
                <button
                  key={c.key}
                  onClick={() =>
                    setSelectedCat(active ? null : (c.value as any) ?? null)
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border whitespace-nowrap transition-all ${
                    active
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-white text-emerald-700 border-gray-200 hover:bg-emerald-50"
                  }`}
                  title={t(lang, `categories.${c.key}`)}
                >
                  <span>{c.icon}</span>
                  <span className="text-sm font-medium">
                    {t(lang, `categories.${c.key}`)}
                  </span>
                </button>
              );
            })}
          </div>

        {/* 🔹 “Cerca de mí” */}
        {onLocateMe && viewMode === "list" && (
          <div className="flex justify-center mt-3">
            <button
              onClick={onLocateMe}
              className="px-4 py-2 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-sm font-semibold"
            >
              📍 {t(lang, "nearby") ?? "Cerca de mí"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
