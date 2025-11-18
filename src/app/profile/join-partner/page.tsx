"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/config";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";


export default function JoinPartnerPage() {
  const { user } = useAuth();
  const { language: lang } = useLanguage();
const router = useRouter();

  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState("");
  const [state, setState] = useState("");
  const [regions, setRegions] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRegions = async () => {
      const { data, error } = await supabase
        .from("places")
        .select("region")
        .not("region", "is", null);

      if (error) return console.error(error);
      const unique = Array.from(new Set(data.map((p: any) => p.region))).sort();
      setRegions(unique);
    };
    fetchRegions();
  }, []);

  const fetchStates = async (selected: string) => {
    setState("");
    const { data, error } = await supabase
      .from("places")
      .select("state")
      .eq("region", selected)
      .not("state", "is", null);

    if (error) return console.error(error);
    const unique = Array.from(new Set(data.map((p: any) => p.state))).sort();
    setStates(unique);
  };

  const handleSubmit = async () => {
    if (!user)
      return toast.error(t(lang, "login_required"));

    if (!name || !businessName || !email || !region)
      return toast.error(t(lang, "fill_required_fields"));

    setLoading(true);

    const { data: lastRequest, error: fetchError } = await supabase
      .from("adi_partners")
      .select("created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") console.error(fetchError);

    if (lastRequest?.created_at) {
      const diffHours =
        (Date.now() - new Date(lastRequest.created_at).getTime()) / 3600000;
      if (diffHours < 24) {
        toast.info(
          t(lang, "wait_before_resubmit") +
            " " +
            t(lang, "try_again_in_hours").replace(
              "{{hours}}",
              (24 - diffHours).toFixed(1)
            )
        );
        setLoading(false);
        return;
      }
    }

    const { error } = await supabase.from("adi_partners").insert([
      {
        user_id: user.id,
        name,
        business_name: businessName,
        email,
        phone,
        region,
        state,
      },
    ]);

    setLoading(false);

    if (error) toast.error(t(lang, "error_submitting_form"));
    else {
      toast.success(t(lang, "form_submitted"));
          router.push("/profile");
      setName("");
      setBusinessName("");
      setPhone("");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <h1 className="text-2xl font-bold text-emerald-600">
            {t(lang, "joinAdiPartner")}
          </h1>

          <Input
            placeholder={t(lang, "full_name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder={t(lang, "business_name")}
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
          <Input
            placeholder={t(lang, "email")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder={t(lang, "phone")}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <p className="text-sm font-medium text-gray-700">{t(lang, "region")}</p>
          <div className="grid grid-cols-2 gap-2">
            {regions.map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRegion(r);
                  fetchStates(r);
                }}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  region === r
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-semibold"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {region && (
            <>
              <p className="text-sm font-medium text-gray-700 mt-2">
                {t(lang, "state")}
              </p>
              {states.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {states.map((s) => (
                    <button
                      key={s}
                      onClick={() => setState(s)}
                      className={`rounded-lg border px-3 py-2 text-sm ${
                        state === s
                          ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-semibold"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic text-sm">
                  {t(lang, "choose_state_optional")}
                </p>
              )}
            </>
          )}

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t(lang, "loading")}
              </>
            ) : (
              t(lang, "send_request")
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
