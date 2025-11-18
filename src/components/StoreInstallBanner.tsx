"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/config";

export default function StoreInstallBanner() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  const { language: lang } = useLanguage();

  // 🔗 Reemplázalos con tus enlaces reales
  const IOS_URL = "https://apps.apple.com/app/a-donde-ir/id6447215805";
  const ANDROID_URL = "https://play.google.com/store/apps/details?id=io.adondeir.com";

  useEffect(() => {
    // Detectar móvil
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) return;

    // Detectar si es iOS
    const _isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsIOS(_isIOS);

    // Mostrar banner
    setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-3 left-0 right-0 z-[5000] px-3">
      <div className="bg-white border shadow-xl rounded-2xl p-4 flex items-center gap-4">
        {/* Texto */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold">
            {t(lang, "installApp.title")}
          </h3>
          <p className="text-sm text-gray-600">
            {t(lang, "installApp.subtitle")}
          </p>
        </div>

        {/* Botón instalar */}
        <a
          href={isIOS ? IOS_URL : ANDROID_URL}
          className="bg-green-600 text-white px-4 py-2 rounded-xl"
        >
          {t(lang, "installApp.installButton")}
        </a>

        {/* Cerrar */}
        <button onClick={() => setShow(false)}>
          <X className="text-gray-500" />
        </button>
      </div>
    </div>
  );
}
