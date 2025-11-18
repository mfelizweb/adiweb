// components/CompactMap.tsx (web)
"use client";

import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useMemo } from "react";

interface Props {
  latitude: number;
  longitude: number;
  name?: string;
  height?: number;
}

export default function CompactMap({
  latitude,
  longitude,
  name,
  height = 220,
}: Props) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
 

 

  });
console.log("clave",process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
  const center = useMemo(
    () => ({ lat: Number(latitude), lng: Number(longitude) }),
    [latitude, longitude]
  );

  if (!isLoaded || !latitude || !longitude) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 text-gray-500 text-sm rounded-xl"
        style={{ width: "100%", height }}
      >
        Cargando mapa…
      </div>
    );
  }

  return (
    <div
      style={{ width: "100%", height }}
      className="rounded-xl overflow-hidden border border-gray-200"
    >
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={center}
        zoom={12}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
        }}
      >
        <Marker
          position={center}
          label={{
            text: name || "Ubicación",
            className: "text-sm font-semibold text-white bg-emerald-600 px-2 py-1 rounded-lg",
          }}
        />
      </GoogleMap>
    </div>
  );
}
