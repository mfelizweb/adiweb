"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { t, type Lang } from "@/i18n/config";
import { useRouter } from "next/navigation";

// 🔹 Categorías básicas, mismas que ExploreScreen pero adaptadas
const CATEGORIES = [
  { key: "all", label: "categories.all", icon: "✨" },
  { key: "beach", label: "categories.beach", icon: "🏖️" },
  { key: "tours", label: "categories.tours", icon: "🗺️" },
  { key: "restaurants", label: "categories.restaurants", icon: "🍽️" },
  { key: "hiking", label: "categories.hiking", icon: "🥾" },
  { key: "hotels", label: "categories.hotels", icon: "🏨" },
];

export function Hero({ lang = "es" as Lang }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const term = searchTerm.trim();
    if (!term && !selectedCat) return;
    router.push(
      `/search?term=${encodeURIComponent(term)}&cat=${selectedCat || ""}`
    );
  };

  return (
    <section className="relative flex flex-col items-center justify-center w-full h-[85vh] overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400 text-white">
      {/* 🔹 Fondo animado con gradiente suave */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.15),transparent_70%)]"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      {/* 🔹 Contenido centrado */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl px-4">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-5xl font-extrabold mb-6 leading-tight drop-shadow-md"
        >
          {t(lang, "hero.title") ||
            "Descubre lugares increíbles en República Dominicana"}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-lg sm:text-xl text-white/90 mb-8"
        >
          {t(lang, "hero.subtitle") ||
            "Explora playas, montañas y experiencias únicas cerca de ti."}
        </motion.p>

        {/* 🔹 Buscador */}
        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex w-full max-w-xl bg-white rounded-full shadow-lg overflow-hidden border border-white/20 focus-within:ring-2 focus-within:ring-white"
        >
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              t(lang, "searchPlaceholder") || "Buscar destinos, playas..."
            }
            className="flex-1 px-5 py-3 text-gray-800 focus:outline-none text-base"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="px-2 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          )}
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 px-5 flex items-center justify-center"
          >
            <Search size={20} className="text-white" />
          </button>
        </motion.form>

        {/* 🔹 Categorías */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex flex-wrap justify-center gap-3 max-w-2xl"
        >
          {CATEGORIES.map((c) => {
            const active = selectedCat === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setSelectedCat(active ? null : c.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  active
                    ? "bg-white text-emerald-700 border-transparent shadow-sm"
                    : "bg-white/10 border-white/30 hover:bg-white/20"
                }`}
              >
                <span>{c.icon}</span>
                {/* ✅ Usa la clave literal del objeto label, que ya coincide con tu i18n plano */}
                <span>{t(lang, c.label)}</span>
              </button>
            );
          })}
        </motion.div>
      </div>

      {/* 🔹 Gradiente inferior animado */}
      <motion.div
        className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-emerald-900/40 to-transparent"
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 6, repeat: Infinity, repeatType: "reverse" }}
      />
    </section>
  );
}
