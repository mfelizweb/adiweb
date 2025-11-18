    import { supabase } from "@/lib/supabase";

export default async function sitemap() {
  const baseUrl = "https://adondeir.net";

  // Obtener todos los places
  const { data: places } = await supabase
    .from("places")
    .select("id, updated_at");

  const placeUrls =
    places?.flatMap((p: any) => [
      {
        url: `${baseUrl}/place/${p.id}`,
        lastModified: p.updated_at || new Date().toISOString(),
      },
      {
        url: `${baseUrl}/es/place/${p.id}`,
        lastModified: p.updated_at || new Date().toISOString(),
      },
      {
        url: `${baseUrl}/en/place/${p.id}`,
        lastModified: p.updated_at || new Date().toISOString(),
      },
    ]) || [];

  return [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
    },
    ...placeUrls,
  ];
}
