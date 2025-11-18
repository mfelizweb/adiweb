 // components/Navbar.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/config";

const navItems = [
  { key: "explore", href: "/" },
  { key: "itineraries", href: "/itineraries" },
  { key: "favorites", href: "/favorites" },
  { key: "profile", href: "/profile" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { language: lang } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur bg-white/70 border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-emerald-600 font-extrabold text-2xl tracking-tight">
          ADI
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2 bg-white/80 backdrop-blur-md border border-gray-200 rounded-full px-3 py-2 shadow-sm">
          {navItems.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.key}
                href={item.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  active
                    ? "bg-emerald-100 text-emerald-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-emerald-700"
                }`}
              >
                {t(lang, item.key)}
              </Link>
            );
          })}
        </div>

        {/* Mobile button */}
        <button
          className="md:hidden p-2 text-gray-700"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-4 space-y-4">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`block text-base font-medium px-2 py-2 rounded-lg ${
                  active
                    ? "text-emerald-600 bg-emerald-50"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setOpen(false)}
              >
                {t(lang, item.key)}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
