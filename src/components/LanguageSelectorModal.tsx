// components/LanguageSelectorModal.tsx (web)
"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { t } from "@/i18n/config";

interface Props {
  open: boolean;
  onClose: () => void;
  lang?: "es" | "en";
  onSelect?: (lng: "es" | "en") => void;
}

export default function LanguageSelectorModal({
  open,
  onClose,
  lang = "es",
  onSelect,
}: Props) {
  const [selected, setSelected] = useState<"es" | "en">(lang);

  useEffect(() => {
    setSelected(lang);
  }, [lang]);

  const handleSelect = (lng: "es" | "en") => {
    setSelected(lng);
    localStorage.setItem("lang", lng);
    if (onSelect) onSelect(lng);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
  <DialogContent className="max-w-xs sm:max-w-sm max-h-[70vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl p-5">

        <DialogHeader>
 <DialogTitle className="text-center text-base font-semibold">
            {t(selected, "choose_language_title")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 mt-4">
          <Image
            src="/icon.png"
            alt="ADI logo"
            width={72}
            height={72}
            className="rounded-xl mb-1"
          />

          {/* English */}
          <Button
            variant={selected === "en" ? "default" : "outline"}
            onClick={() => handleSelect("en")}
            className="w-full flex items-center justify-center gap-2"
          >
            <span className="text-lg">🇺🇸</span>
            <span className="font-medium">{t(selected, "english")}</span>
          </Button>

          {/* Español */}
          <Button
            variant={selected === "es" ? "default" : "outline"}
            onClick={() => handleSelect("es")}
            className="w-full flex items-center justify-center gap-2"
          >
            <span className="text-lg">🇪🇸</span>
            <span className="font-medium">{t(selected, "spanish")}</span>
          </Button>

          <p className="text-gray-500 text-sm text-center mt-2">
            {t(selected, "language_note")}
          </p>

          <button
            onClick={onClose}
            className="mt-3 text-sm text-gray-500 hover:underline"
          >
            ✕ {t(selected, "cancel")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
