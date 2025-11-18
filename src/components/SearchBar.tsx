"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface SearchBarProps {
  placeholder: string;
  onSubmit: (q: string) => void;
}

export function SearchBar({ placeholder, onSubmit }: SearchBarProps) {
  const [q, setQ] = useState("");

  return (
    <motion.form
      onSubmit={(e) => {
        e.preventDefault();
        if (!q.trim()) return;
        onSubmit(q.trim());
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative flex items-center gap-2 rounded-2xl bg-white/90 backdrop-blur border border-black/10 shadow-soft p-2"
      role="search"
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none px-3 py-3 text-base text-foreground"
      />
      <button
        type="submit"
        className="btn-touch rounded-xl bg-foreground text-white px-4 py-3 font-medium hover:opacity-90"
      >
        Buscar
      </button>
    </motion.form>
  );
}
