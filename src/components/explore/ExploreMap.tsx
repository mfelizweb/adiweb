"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  GoogleMap,
  useLoadScript,
  MarkerF as Marker,
} from "@react-google-maps/api";
import { t, type Lang } from "@/i18n/config";
import { motion } from "framer-motion";
import Link from "next/link";
import { trackEvent } from "@/lib/trackEvent";

 
const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;

function fallbackImg(text: string) {
  return `https://placehold.co/600x400?text=${encodeURIComponent(text)}`;
}

interface Props {
  lang: Lang;
  places: any[];
}

export default function ExploreMap({ lang, places }: Props) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_KEY,
  });

  // 🔹 Calcular centro inicial
  const defaultCenter = { lat: 18.5, lng: -69.9 };

  useEffect(() => {
    if (!mapRef.current || !places.length) return;
    const bounds = new window.google.maps.LatLngBounds();
    places.forEach((p) => {
      if (p.latitude && p.longitude) {
        bounds.extend(new google.maps.LatLng(p.latitude, p.longitude));
      }
    });
    if (!bounds.isEmpty()) mapRef.current.fitBounds(bounds);
  }, [places]);

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
  <div className="relative w-full h-screen max-h-screen overflow-hidden">

      <GoogleMap
      mapContainerStyle={{ width: "100%", height: "100%", borderRadius: 0 }}

        center={defaultCenter}
        zoom={8}
        onLoad={(map) => {
          mapRef.current = map;
        }}
      >
        {places
          .filter((p) => p.latitude && p.longitude)
          .map((p) => (
            <Marker
              key={p.id}
              position={{ lat: p.latitude, lng: p.longitude }}
              onClick={() => {
                setSelectedPlace(p);
                trackEvent({
                  event_type: "map_marker_click",
                  place_id: p.id,
                  place_name: p.name,
                  region: p.region,
                  state: p.state,
                });
              }}
            />
          ))}
      </GoogleMap>

      {/* 🔹 Card inferior animada */}
      {selectedPlace && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="absolute bottom-5 left-4  -translate-x-1/2 bg-white rounded-2xl shadow-xl w-[90%] max-w-md overflow-hidden"
        >
          <img
            src={
              selectedPlace.image ||
              selectedPlace.image1 ||
              selectedPlace.image2 ||
              fallbackImg("ADI")
            }
            alt={selectedPlace.name}
            className="w-full h-20 object-cover"
          />
          <div className="p-4">
            <h3 className="font-bold text-lg text-gray-800">
              {selectedPlace.name}
            </h3>
            <p className="text-sm text-gray-500 mb-3">
              {[selectedPlace.state, selectedPlace.region]
                .filter(Boolean)
                .join(", ")}
            </p>
            <Link
              href={`/place/${selectedPlace.id}`}
              className="inline-block text-emerald-600 font-semibold hover:underline"
              onClick={() =>
                trackEvent({
                  event_type: "map_card_click",
                  place_id: selectedPlace.id,
                  place_name: selectedPlace.name,
                  region: selectedPlace.region,
                  state: selectedPlace.state,
                })
              }
            >
              {t(lang, "viewDetails") ?? "View details"}
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
