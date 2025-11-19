"use client";
export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  MapPin,
  Star,
  Globe,
  Tag,
  ArrowLeft,
  Heart,
  Share2,
  Loader2,
} from "lucide-react";
import { t, type Lang } from "@/i18n/config";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import LoginModal from "@/components/LoginModal";

interface Place {
  id: string;
  name: string;
  descripcion: string | null;
  descripcion_en: string | null;
  image: string | null;
  image1: string | null;
  image2: string | null;
  region: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  category: string | null;
  main_category: string | null;
  partner_url: string | null;
  rating: number | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
  profiles?: { name?: string } | { name?: string }[] | null;
}

export default function PlaceDetailPage() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const lang: Lang = locale === "en" || locale === "es" ? locale : "es";

  const { id } = useParams();
  const router = useRouter();

  const [place, setPlace] = useState<Place | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingDist, setRatingDist] = useState<Record<number, number>>({});
  const [avgRating, setAvgRating] = useState<number>(0);
  const [favorite, setFavorite] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState<number>(0);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  const gallery = [place?.image, place?.image1, place?.image2].filter(Boolean);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const { data: session } = await supabase.auth.getSession();
      const uid = session.session?.user.id || null;
      setUserId(uid);

      const { data: placeData } = await supabase
        .from("places")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (placeData) setPlace(placeData);

      const { data: reviewData } = await supabase
        .from("place_reviews")
        .select("id, rating, comment, created_at, user_id, profiles(name)")
        .eq("place_id", id)
        .order("created_at", { ascending: false });

      if (reviewData) {
        setReviews(reviewData);
        calcAverageAndDistribution(reviewData);

        if (uid) {
          const existing = reviewData.find((r) => r.user_id === uid) || null;
          setUserReview(existing);
          setRating(existing?.rating || 0);
          setComment(existing?.comment || "");
        }
      }

      if (uid) {
        const { data: fav } = await supabase
          .from("favorites")
          .select("id")
          .eq("place_id", id)
          .eq("user_id", uid)
          .maybeSingle();
        setFavorite(!!fav);
      }

      subscribeRealtime();
      setLoading(false);
    };
    if (id) fetchAll();
  }, [id]);

  function calcAverageAndDistribution(list: Review[]) {
    if (!list.length) {
      setAvgRating(0);
      setRatingDist({});
      return;
    }
    const avg = list.reduce((a, r) => a + r.rating, 0) / list.length;
    setAvgRating(avg);
    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    list.forEach((r) => (dist[r.rating] = (dist[r.rating] || 0) + 1));
    setRatingDist(dist);
  }

  function subscribeRealtime() {
    const channel = supabase
      .channel("place_reviews_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "place_reviews" },
        (payload) => {
          const newReview = payload.new as any;
          if (newReview?.place_id === id) fetchReviews();
        }
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }

  async function fetchReviews() {
    const { data } = await supabase
      .from("place_reviews")
      .select("id, rating, comment, created_at, user_id, profiles(name)")
      .eq("place_id", id)
      .order("created_at", { ascending: false });
    if (data) {
      setReviews(data);
      calcAverageAndDistribution(data);
    }
  }

  async function toggleFavorite() {
    if (!userId) return setShowLogin(true);
    if (favorite) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("place_id", id);
      setFavorite(false);
    } else {
      await supabase.from("favorites").insert([{ user_id: userId, place_id: id }]);
      setFavorite(true);
    }
  }

  async function saveReview() {
    if (!userId) return setShowLogin(true);
    if (!rating) return alert(t(lang, "ratingRequired"));

    const payload = {
      place_id: id,
      user_id: userId,
      rating,
      comment: comment.trim(),
    };

    const { data: existing } = await supabase
      .from("place_reviews")
      .select("id")
      .eq("place_id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("place_reviews")
        .update({
          rating: payload.rating,
          comment: payload.comment,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("place_reviews").insert([payload]);
    }

    await fetchReviews();
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="animate-spin text-foreground/60" size={32} />
      </div>
    );

  if (!place)
    return (
      <p className="text-center py-16 text-foreground/60">
        {t(lang, "place_not_found")}
      </p>
    );

  const description =
    lang === "en"
      ? place.descripcion_en || place.descripcion
      : place.descripcion || place.descripcion_en;

  return (
    <main className="container max-w-4xl mx-auto py-10 sm:py-12 relative">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="fixed top-4 left-4 z-50 bg-white/80 backdrop-blur border border-black/10 shadow rounded-full p-2 hover:bg-white transition"
      >
        <ArrowLeft size={20} />
      </button>

      {/* Gallery */}
      {gallery.length > 0 && (
        <div className="mb-8 rounded-3xl overflow-hidden shadow-lg">
          <Swiper
            modules={[Pagination, Navigation]}
            pagination={{ clickable: true }}
            navigation
            spaceBetween={10}
            slidesPerView={1}
            className="w-full h-[60vh] sm:h-[70vh]"
          >
            {gallery.map((img, idx) => (
              <SwiperSlide key={idx}>
                <img
                  src={img as string}
                  alt={`${place.name} ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* Title + Favorite + Share */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            {place.name}
          </h1>
          <button
            onClick={toggleFavorite}
            className={`p-2 rounded-full border border-black/10 hover:scale-105 transition ${
              favorite ? "bg-red-500 text-white" : "bg-white text-red-500"
            }`}
          >
            <Heart size={18} fill={favorite ? "currentColor" : "none"} />
          </button>
          <button
            onClick={() =>
              navigator.share?.({
                title: place.name,
                url: `https://adondeir.net/place/${place.id}`,
              })
            }
            className="flex items-center gap-1 text-primary border border-primary px-3 py-1.5 rounded-full hover:bg-primary hover:text-white transition"
          >
            <Share2 size={16} />
            <span>{t(lang, "share")}</span>
          </button>
        </div>

        <div className="flex items-center gap-1 text-yellow-500">
          <Star size={18} fill="currentColor" />
          <span className="font-semibold">{avgRating.toFixed(1)}</span>
          <span className="text-foreground/60 text-sm">
            ({reviews.length} {t(lang, "reviews")})
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-wrap items-center gap-3 text-foreground/70 mb-6">
        {(place.state || place.region) && (
          <div className="flex items-center gap-1">
            <MapPin size={18} />
            <span>{place.state || place.region}</span>
          </div>
        )}
        {place.main_category && (
          <div className="flex items-center gap-1">
            <Tag size={16} />
            <span>{place.main_category}</span>
          </div>
        )}
        {place.partner_url && (
          <a
            href={place.partner_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-primary font-medium hover:underline"
          >
            <Globe size={16} />
            {t(lang, "official_site")}
          </a>
        )}
      </div>

      {/* Description */}
      <div className="bg-card border border-black/10 rounded-3xl p-6 shadow-sm">
        <p className="text-base leading-relaxed text-foreground/80 whitespace-pre-line">
          {description || t(lang, "no_description")}
        </p>
      </div>

      {/* Reviews */}
      <section className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">{t(lang, "userReviews")}</h2>

        {/* Distribution bars */}
        {reviews.length > 0 && (
          <div className="space-y-1 mb-6">
            {[5, 4, 3, 2, 1].map((n) => (
              <div key={n} className="flex items-center gap-2">
                <span className="w-4 text-sm">{n}</span>
                <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{
                      width: `${((ratingDist[n] || 0) / (reviews.length || 1)) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {reviews.length === 0 ? (
          <p className="text-foreground/60">{t(lang, "noReviews")}</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="border border-black/10 bg-card rounded-2xl p-4 shadow-sm"
              >
                <p className="font-semibold text-foreground">
                  {Array.isArray(r.profiles)
                    ? r.profiles[0]?.name || t(lang, "anonymousUser")
                    : r.profiles?.name || t(lang, "anonymousUser")}
                </p>

                <div className="flex items-center gap-1 text-yellow-500">
                  {"⭐".repeat(r.rating)}
                </div>
                <p className="text-foreground/80">{r.comment}</p>
                <p className="text-xs text-foreground/50 mt-1">
                  {new Date(r.created_at).toLocaleDateString(
                    lang === "en" ? "en-US" : "es-ES"
                  )}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Form */}
        <div className="mt-8 border border-black/10 bg-card rounded-3xl p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-3">
            {userReview ? t(lang, "editReview") : t(lang, "writeReview")}
          </h3>
          <div className="flex gap-2 mb-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} onClick={() => setRating(i)} className="text-yellow-500">
                <Star
                  size={26}
                  fill={i <= rating ? "currentColor" : "none"}
                  stroke="currentColor"
                />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t(lang, "yourComment")}
            className="w-full border border-gray-200 rounded-xl p-3 h-28 text-sm text-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
          />
          <button
            onClick={saveReview}
            className="mt-3 bg-primary text-white font-medium px-5 py-2.5 rounded-xl hover:bg-primary/90 transition"
          >
            {t(lang, "saveReview")}
          </button>
        </div>
      </section>

      {/* Map */}
      {place.latitude && place.longitude && (
        <div className="mt-10 rounded-3xl overflow-hidden shadow-md">
          <iframe
            title="Mapa"
            width="100%"
            height="380"
            style={{ border: 0 }}
            loading="lazy"
            src={`https://maps.google.com/maps?q=${place.latitude},${place.longitude}&z=13&output=embed`}
          ></iframe>
        </div>
      )}

      {/* Modal Login */}
      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} lang={lang} />

      {/* Schema.org for SEO */}
      {place && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "TouristAttraction",
              name: place.name,
              description:
                lang === "en"
                  ? place.descripcion_en || place.descripcion
                  : place.descripcion || place.descripcion_en,
              image: [place.image, place.image1, place.image2].filter(Boolean),
              url: `https://adondeir.net/place/${place.id}`,
              address: {
                "@type": "PostalAddress",
                addressRegion: place.state,
                addressCountry: "US",
              },
              geo:
                place.latitude && place.longitude
                  ? {
                      "@type": "GeoCoordinates",
                      latitude: place.latitude,
                      longitude: place.longitude,
                    }
                  : undefined,
              aggregateRating:
                avgRating > 0
                  ? {
                      "@type": "AggregateRating",
                      ratingValue: avgRating.toFixed(1),
                      ratingCount: reviews.length,
                    }
                  : undefined,
            }),
          }}
        />
      )}
    </main>
  );
}
