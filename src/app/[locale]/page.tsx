 import React from "react";
import { Hero } from "@/components/Hero";
import { DestinosGrid } from "@/components/DestinosGrid";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const lang = (locale === "es" || locale === "en" ? locale : "es") as "es" | "en";

  return (
    <main>
      <Hero lang={lang} />
      <DestinosGrid lang={lang} />
    </main>
  );
}
