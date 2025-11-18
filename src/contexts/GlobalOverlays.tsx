"use client";

import React from "react";
import { useOverlay } from "@/contexts/OverlayContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { t } from "@/i18n/config";
import StateSelector from "./StateSelector";
 
/* 🔹 Modal base reutilizable para mantener consistencia */
function ModalBase({
  title,
  onClose,
  children,
}: {
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-11/12 max-w-md p-6 relative">
        {title && (
          <h2 className="text-lg font-semibold text-center mb-4 text-gray-800">
            {title}
          </h2>
        )}
        <div className="max-h-[70vh] overflow-y-auto">{children}</div>
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

/* ---------------- MAIN COMPONENT ---------------- */
export default function GlobalOverlays() {
  const {
    showWelcome,
    showLanguage,
    showState,
    showFeedback,
    showLogin,
    closeAll,
  } = useOverlay();

  const { language: lang, selectLanguage } = useLanguage();
  const { user, signOut } = useAuth();

  /* --------------- WELCOME MODAL --------------- 
  if (showWelcome) {
    return (
      <ModalBase title={t(lang, "welcome")} onClose={closeAll}>
        <p className="text-center text-gray-700 mb-4">
          {t(lang, "welcome_message")}
        </p>
        <button
          className="w-full bg-emerald-600 text-white rounded-lg py-2 font-medium"
          onClick={() => {
            localStorage.setItem("welcomeSeen", "1");
            closeAll();
          }}
        >
          {t(lang, "start_exploring")}
        </button>
      </ModalBase>
    );
  }
*/
  /* --------------- LANGUAGE MODAL --------------- */
  if (showLanguage) {
    return (
      <ModalBase title={t(lang, "selectLanguage")} onClose={closeAll}>
        <div className="flex flex-col gap-3">
          {["es", "en"].map((code) => (
            <button
              key={code}
              onClick={async () => {
                await selectLanguage(code as "es" | "en");
                closeAll();
              }}
              className={`w-full border rounded-lg py-2 font-medium ${
                lang === code
                  ? "bg-emerald-600 text-white"
                  : "hover:bg-gray-50 border-gray-200"
              }`}
            >
              {code === "es" ? "Español" : "English"}
            </button>
          ))}
        </div>
      </ModalBase>
    );
  }

 
/* --------------- STATE SELECTOR --------------- */
if (showState) {
  return (
    <ModalBase title={t(lang, "location")} onClose={closeAll}>
      <StateSelector visible={true} onClose={closeAll} />
    </ModalBase>
  );
}

  /* --------------- FEEDBACK MODAL --------------- */
  if (showFeedback) {
    return (
      <ModalBase title={t(lang, "feedback")} onClose={closeAll}>
        <p className="text-gray-600 text-sm mb-3">
          {t(lang, "feedback_prompt")}
        </p>
        <textarea
          placeholder={t(lang, "write_feedback")}
          className="w-full border border-gray-300 rounded-lg p-2 min-h-[100px] mb-4 focus:ring-emerald-500 focus:border-emerald-500"
        />
        <button
          className="w-full bg-emerald-600 text-white rounded-lg py-2 font-medium"
          onClick={() => {
            alert(t(lang, "thank_you_feedback"));
            closeAll();
          }}
        >
          {t(lang, "send")}
        </button>
      </ModalBase>
    );
  }

  /* --------------- LOGIN MODAL --------------- */
  if (showLogin) {
    return (
      <ModalBase title={t(lang, "login")} onClose={closeAll}>
        {user ? (
          <div className="text-center space-y-4">
            <p>{t(lang, "logged_as")}: {user.email}</p>
            <button
              className="w-full bg-red-500 text-white rounded-lg py-2 font-medium"
              onClick={signOut}
            >
              {t(lang, "sign_out")}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <button
              className="bg-emerald-600 text-white py-2 rounded-lg font-medium"
              onClick={() => alert("TODO: login redirect")}
            >
              {t(lang, "continue_with_email")}
            </button>
            <button
              className="bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200"
              onClick={() => alert("TODO: Google login")}
            >
              Google
            </button>
          </div>
        )}
      </ModalBase>
    );
  }

  return null;
}
