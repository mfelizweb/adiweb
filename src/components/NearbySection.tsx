import React from "react";
import { SectionHeader } from "./SectionHeader";

export function NearbySection() {
  return (
    <section className="container py-12">
      <SectionHeader
        title="Cerca de ti"
        subtitle="Descubre experiencias próximas a tu ubicación"
      />
      <div className="h-64 rounded-2xl bg-gradient-to-tr from-primary/10 to-accent shadow-soft flex items-center justify-center">
        <p className="text-foreground/70">🗺️ Próximamente: mapa con lugares cercanos</p>
      </div>
    </section>
  );
}
