// src/lib/trackEvent.ts
import { supabase } from "./supabase";

export const trackEvent = async (event: {
  user_id?: string | null;
  event_type: string;
  place_id?: string | null;
  itinerary_id?: string | null;
  place_name?: string | null;
  partner?: string | null;
  destination?: string | null;
  region?: string | null;
  state?: string | null;
}) => {
  try {
    const { error } = await supabase.rpc("track_analytics_event", {
      p_user_id: event.user_id,
      p_event_type: event.event_type,
      p_place_id: event.place_id,
      p_itinerary_id: event.itinerary_id,
      p_place_name: event.place_name,
      p_partner: event.partner,
      p_destination: event.destination,
      p_region: event.region,
      p_state: event.state,
    });

    if (error) console.warn("⚠️ Error en trackEvent RPC:", error);
  } catch (e) {
    console.warn("⚠️ Error guardando evento:", e);
  }
};
