"use client";
export const dynamic = "force-dynamic";
import React, { useCallback, useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { t } from "@/i18n/config";
import { toast } from "sonner";
import {
  ArrowLeft,
  Heart,
  Loader2,
  Star,
  UserPlus,
  Copy,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ItineraryDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const lang = "es"; // puedes obtenerlo desde tu LanguageContext
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [itinerary, setItinerary] = useState<any>(null);
  const [places, setPlaces] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [ratingDist, setRatingDist] = useState<any>({});
  const [hasLiked, setHasLiked] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [userReview, setUserReview] = useState<any>(null);
  const [visibleCount, setVisibleCount] = useState(3);
  const [loadingReview, setLoadingReview] = useState(false);

  // compartir
  const [shareVisible, setShareVisible] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [sharePermission, setSharePermission] = useState<"view" | "edit">(
    "view"
  );
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    fetchItinerary();
  }, [id]);

  async function fetchItinerary() {
    setLoading(true);
    const { data: itineraryData, error } = await supabase
      .from("itineraries")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }

    setItinerary(itineraryData);

    const { data: rawPlaces } = await supabase
      .from("itinerary_places")
      .select(
        "id, day, order_index, place_id, places(id, name, descripcion, descripcion_en, image, partner_url)"
      )
      .eq("itinerary_id", id)
      .order("day")
      .order("order_index");

    setPlaces(rawPlaces || []);
    setLoading(false);

    if (itineraryData?.is_public) {
      fetchCommunityData(itineraryData.id);
    }
  }

  async function fetchCommunityData(itineraryId: string) {
    const { data, error } = await supabase
      .from("itinerary_reviews")
      .select("id, rating, comment, created_at, user_id, profiles(name)")
      .eq("itinerary_id", itineraryId)
      .order("created_at", { ascending: false });

    if (error) return;

    const reviewList = data || [];
    setReviews(reviewList);

    if (reviewList.length > 0) {
      const total = reviewList.length;
      const avg = reviewList.reduce((s, r) => s + r.rating, 0) / total;
      setAvgRating(parseFloat(avg.toFixed(1)));
      setReviewCount(total);

      const dist: any = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      reviewList.forEach((r) => (dist[r.rating] += 1));
      setRatingDist(dist);
    } else {
      setAvgRating(0);
      setReviewCount(0);
      setRatingDist({});
    }

    if (user) {
      const existing = reviewList.find((r) => r.user_id === user.id);
      setUserReview(existing || null);
      setRating(existing?.rating || 0);
      setComment(existing?.comment || "");

      const { data: like } = await supabase
        .from("itinerary_likes")
        .select("id")
        .eq("itinerary_id", itineraryId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (like) setHasLiked(true);
    }
  }

  async function handleLike() {
    if (!user?.id) {
      toast.error(t(lang, "login_required"));
      return;
    }

    const { error } = await supabase
      .from("itinerary_likes")
      .insert([{ itinerary_id: itinerary.id, user_id: user.id }]);

    if (!error) {
      setHasLiked(true);
      toast.success(t(lang, "thanks_for_like"));
    }
  }

  async function saveReview() {
    if (!user) {
      toast.error(t(lang, "login_required"));
      return;
    }
    if (!rating) {
      toast.info(t(lang, "ratingRequired"));
      return;
    }
    setLoadingReview(true);
    try {
      const payload = {
        itinerary_id: itinerary.id,
        user_id: user.id,
        rating,
        comment: comment.trim(),
      };
      const { data: existing } = await supabase
        .from("itinerary_reviews")
        .select("id")
        .eq("itinerary_id", itinerary.id)
        .eq("user_id", user.id)
        .maybeSingle();

      let error;
      if (existing) {
        ({ error } = await supabase
          .from("itinerary_reviews")
          .update({
            rating: payload.rating,
            comment: payload.comment,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id));
      } else {
        ({ error } = await supabase.from("itinerary_reviews").insert([payload]));
      }

      if (error) throw error;

      await fetchCommunityData(itinerary.id);
      toast.success(t(lang, "reviewSaved"));
    } catch {
      toast.error(t(lang, "errorSavingReview"));
    } finally {
      setLoadingReview(false);
    }
  }

  async function handleShareItinerary() {
    if (!shareEmail.trim()) {
      toast.error(t(lang, "enter_email"));
      return;
    }

    if (!user) {
      toast.error(t(lang, "login_required"));
      return;
    }

    setSharing(true);

    try {
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id, email")
        .ilike("email", shareEmail.trim())
        .maybeSingle();

      const { data: already } = await supabase
        .from("itinerary_collaborators")
        .select("id")
        .eq("itinerary_id", itinerary.id)
        .in("user_id", existingUser ? [existingUser.id] : [])
        .maybeSingle();

      const { data: pendingInvite } = await supabase
        .from("itinerary_invites")
        .select("id")
        .eq("itinerary_id", itinerary.id)
        .ilike("invited_email", shareEmail.trim())
        .maybeSingle();

      if (already || pendingInvite) {
        toast.info(t(lang, "already_invited"));
        setSharing(false);
        return;
      }

      if (existingUser) {
        const { error } = await supabase.from("itinerary_collaborators").insert({
          itinerary_id: itinerary.id,
          user_id: existingUser.id,
          permission: sharePermission,
          added_by: user.id,
        });
        if (error) throw error;
        toast.success(t(lang, "collaborator_added"));
      } else {
        const { error } = await supabase.from("itinerary_invites").insert({
          itinerary_id: itinerary.id,
          invited_email: shareEmail.trim(),
          permission: sharePermission,
          invited_by: user.id,
        });
        if (error) throw error;
        toast.info(t(lang, "invite_pending"));
      }
      setShareVisible(false);
    } catch {
      toast.error(t(lang, "unexpected_error"));
    } finally {
      setSharing(false);
    }
  }

  if (loading)
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* 🔙 Volver */}
      <Button
        variant="ghost"
        className="flex items-center gap-2 mb-4"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-5 h-5" />
        {t(lang, "back")}
      </Button>

      <h1 className="text-3xl font-bold mb-4">{itinerary?.name}</h1>

      {/* 🔹 Acciones principales */}
      <div className="flex flex-wrap gap-3 mb-6">
        {itinerary?.user_id === user?.id && (
          <>
            <Button
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => router.push(`/itinerary/edit/${itinerary.id}`)}
            >
              <Pencil className="w-4 h-4 mr-2" />
              {t(lang, "edit_itinerary")}
            </Button>
            <Button
              variant="outline"
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              onClick={() => setShareVisible(true)}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {t(lang, "add_collaborators")}
            </Button>
          </>
        )}

        {itinerary?.user_id !== user?.id && (
          <Button
            className="bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={() => toast.success(t(lang, "cloned_success"))}
            disabled={saving}
          >
            <Copy className="w-4 h-4 mr-2" />
            {t(lang, "clone")}
          </Button>
        )}

        {/* 📤 Compartir público */}
<Button
  variant="outline"
  className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
  onClick={() => {
    const shareUrl = `https://adondeir.net/itinerary/${itinerary.id}`;

    if (navigator.share) {
      navigator
        .share({
          title: itinerary.name,
          text: "Mira este itinerario en Adonde Ir",
          url: shareUrl,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Enlace copiado");
    }
  }}
>
  <Copy className="w-4 h-4 mr-2" />
  Compartir
</Button>

      </div>

      {/* 📍 Lugares */}
      <h2 className="text-xl font-semibold mb-3">{t(lang, "places")}</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {places.map((item, i) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-lg">
            {item.places?.image && (
              <Image
                src={item.places.image}
                alt={item.places.name}
                width={600}
                height={400}
                className="w-full h-48 object-cover"
              />
            )}
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-1">
                {i + 1}. {item.places?.name}
              </h3>
              {item.places?.descripcion && (
                <p className="text-sm text-gray-600 mb-2">
                  {lang === "es"
                    ? item.places.descripcion
                    : item.places.descripcion_en}
                </p>
              )}
              {item.places?.partner_url && (
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => window.open(item.places.partner_url, "_blank")}
                >
                  {t(lang, "reserve")}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ❤️ Like */}
      {itinerary?.is_public && (
        <div className="flex justify-center mt-10">
          <Button
            variant="ghost"
            className="text-emerald-600 flex items-center gap-2"
            onClick={handleLike}
            disabled={hasLiked}
          >
            <Heart
              className={`w-5 h-5 ${
                hasLiked ? "fill-emerald-600 text-emerald-600" : ""
              }`}
            />
            {hasLiked
              ? t(lang, "liked_thanks")
              : t(lang, "like_itinerary")}
          </Button>
        </div>
      )}

      {/* 🗣️ Reseñas */}
      {itinerary?.is_public && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-3">
            {t(lang, "userReviews")}
          </h2>

          <div className="flex items-center gap-2 mb-4">
            <Star className="text-yellow-400 w-5 h-5" />
            <span className="font-medium">
              {avgRating?.toFixed(1) || "–"} ({reviewCount})
            </span>
          </div>

          {reviews.slice(0, visibleCount).map((r) => (
            <Card key={r.id} className="p-4 mb-3">
              <h4 className="font-semibold">{r.profiles?.name}</h4>
              <p className="text-yellow-500 text-sm">
                {"⭐".repeat(r.rating)} ({r.rating}/5)
              </p>
              <p className="text-gray-700">{r.comment}</p>
            </Card>
          ))}

          {reviews.length > 3 && (
            <Button
              variant="ghost"
              className="text-emerald-600"
              onClick={() =>
                setVisibleCount(visibleCount === 3 ? reviews.length : 3)
              }
            >
              {visibleCount === 3
                ? t(lang, "seeMoreReviews")
                : t(lang, "seeLessReviews")}
            </Button>
          )}

          {user && (
            <Card className="p-4 mt-6 border border-gray-200">
              <h3 className="font-semibold mb-2">
                {userReview
                  ? t(lang, "editReview")
                  : t(lang, "writeReview")}
              </h3>
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`cursor-pointer w-6 h-6 ${
                      i <= rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                    onClick={() => setRating(i)}
                  />
                ))}
              </div>
              <Textarea
                placeholder={t(lang, "yourComment")}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <Button
                className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={saveReview}
                disabled={loadingReview}
              >
                {loadingReview && (
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                )}
                {t(lang, "saveReview")}
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* 👥 Dialog compartir */}
      <Dialog open={shareVisible} onOpenChange={setShareVisible}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t(lang, "share_with_friend")}</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="email@example.com"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
          />
          <div className="flex gap-2 mt-3">
            <Button
              variant={sharePermission === "view" ? "default" : "outline"}
              className={
                sharePermission === "view"
                  ? "bg-emerald-600 text-white"
                  : ""
              }
              onClick={() => setSharePermission("view")}
            >
              {t(lang, "view_only")}
            </Button>
            <Button
              variant={sharePermission === "edit" ? "default" : "outline"}
              className={
                sharePermission === "edit"
                  ? "bg-emerald-600 text-white"
                  : ""
              }
              onClick={() => setSharePermission("edit")}
            >
              {t(lang, "can_edit")}
            </Button>
          </div>
          <Button
            className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleShareItinerary}
            disabled={sharing}
          >
            {sharing && <Loader2 className="animate-spin w-4 h-4 mr-2" />}
            {t(lang, "send_invite")}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
