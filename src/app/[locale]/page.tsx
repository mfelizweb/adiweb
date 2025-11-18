import React from "react";
import { Hero } from "@/components/Hero";
import { DestinosGrid } from "@/components/DestinosGrid";

export default function HomePage({ params }: { params: { locale: string } }) {
  const lang = params.locale as "es" | "en";
  return (
    <main>
      <Hero lang={lang} />
      <DestinosGrid lang={lang} />
    </main>
  );
}
