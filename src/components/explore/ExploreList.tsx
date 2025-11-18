"use client";

import React from "react";
import { t, type Lang } from "@/i18n/config";
import { motion } from "framer-motion";
import Link from "next/link";
import { trackEvent } from "@/lib/trackEvent";

const GYG_PARTNER_ID = process.env.NEXT_PUBLIC_GYG_PARTNER_ID!;

function fallbackImg(text: string) {
  return `https://placehold.co/600x400?text=${encodeURIComponent(text)}`;
}

interface Place {
  id: string;
  name: string;
  image_url?: string | null;
  region?: string | null;
  state?: string | null;
  isSponsored?: boolean;
  partner_url?: string | null;
}

interface Props {
  lang: Lang;
  places: Place[];
}

export default function ExploreList({ lang, places }: Props) {
  if (!places.length) {
    return (
      <p className="text-center text-gray-500">
        {t(lang, "noResults") ?? "No se encontraron resultados."}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {places.map((p) =>
        p.isSponsored ? (
          // 🔹 Sponsored card (GetYourGuide)
          <a
            key={p.id}
            href={`https://www.getyourguide.com/s/?q=${encodeURIComponent(
              p.region || "Dominican Republic"
            )}&partner_id=${GYG_PARTNER_ID}&utm_source=adi&utm_medium=web`}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-emerald-500 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all bg-white"
            onClick={() =>
              trackEvent({
                event_type: "sponsored_click",
                partner: "getyourguide",
                region: p.region,
                state: p.state,
              })
            }
          >
            <img
              src={p.image_url || fallbackImg("GYG")}
              alt="Sponsored"
              className="w-full h-40 object-cover"
            />
            <div className="p-3">
              <h3 className="font-semibold text-sm text-gray-800">
                {t(lang, "gygCardTitle")?.replace(
                  "{{state}}",
                  p.region || "Dominican Republic"
                )}
              </h3>
              <p className="text-emerald-600 font-medium text-sm mt-1">
                {t(lang, "gygButton") ?? "Ver tours"}
              </p>
            </div>
          </a>
        ) : (
          // 🔸 Regular ADI place card
          <motion.div
            key={p.id}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl overflow-hidden shadow hover:shadow-md transition-all"
          >
            <Link
              href={`/place/${p.id}`}
              onClick={() =>
                trackEvent({
                  event_type: "place_clicked",
                  place_id: p.id,
                  place_name: p.name,
                  region: p.region,
                  state: p.state,
                })
              }
            >
              <img
                src={p.image_url || fallbackImg("ADI")}
                alt={p.name}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 truncate">
                  {p.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {[p.state, p.region].filter(Boolean).join(", ")}
                </p>
              </div>
            </Link>
          </motion.div>
        )
      )}
    </div>
  );
}
