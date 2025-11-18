import React from "react";
import { SectionHeader } from "./SectionHeader";

export function SponsoredGrid() {
  const offers = [
    { title: "Tour de lujo en catamarán", provider: "Viator", price: 120 },
    { title: "Excursión ecológica GYG", provider: "GetYourGuide", price: 80 },
  ];

  return (
    <section className="container py-12">
      <SectionHeader title="Ofertas patrocinadas" subtitle="Tours y actividades de nuestros socios" />
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {offers.map((o) => (
          <div
            key={o.title}
            className="rounded-2xl border border-black/10 bg-card shadow-soft p-4 relative overflow-hidden"
          >
            <span className="absolute top-3 right-3 text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full shadow-sm">
              Patrocinado
            </span>
            <h3 className="font-semibold text-lg mb-1">{o.title}</h3>
            <p className="text-sm text-foreground/60">por {o.provider}</p>
            <p className="text-primary font-bold mt-2">Desde ${o.price}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
