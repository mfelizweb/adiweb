"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface OverlayContextProps {
 
  showLanguage: boolean;
  showState: boolean;
  showFeedback: boolean;
  showLogin: boolean;

 
  openLanguage: () => void;
  openState: () => void;
  openFeedback: () => void;
  openLogin: () => void;

  closeAll: () => void;

  bootstrapped: boolean;
}

const OverlayContext = createContext<OverlayContextProps>({
 
  showLanguage: false,
  showState: false,
  showFeedback: false,
  showLogin: false,
 
  openLanguage: () => {},
  openState: () => {},
  openFeedback: () => {},
  openLogin: () => {},
  closeAll: () => {},
  bootstrapped: false,
});

export function OverlayProvider({ children }: { children: ReactNode }) {
  const [showWelcome, setShowWelcome] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [showState, setShowState] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);

  const { bootstrapped: authReady, user } = useAuth();

  const checkInitialModals = () => {
 
    const lang = localStorage.getItem("appLanguage");
    if (!lang) localStorage.setItem("appLanguage", "en");

   /* if (!welcomeSeen) {
      setShowWelcome(true);
      setBootstrapped(false);
      return;
    }*/
    setShowWelcome(false);
    setShowLanguage(false);
    setShowState(false);
    setBootstrapped(true);
  };

  useEffect(() => {
    checkInitialModals();
  }, []);

  useEffect(() => {
    if (authReady) checkInitialModals();
  }, [authReady, user]);

  const closeAll = () => {
    setShowWelcome(false);
    setShowLanguage(false);
    setShowState(false);
    setShowFeedback(false);
    setShowLogin(false);
  };

  /*const openWelcome = () => {
    closeAll();
    setShowWelcome(true);
    setBootstrapped(false);
  };*/
  const openLanguage = () => {
    closeAll();
    setShowLanguage(true);
 
  };
  const openState = () => {
    closeAll();
    setShowState(true);
 
  };
  const openFeedback = () => {
    closeAll();
    setShowFeedback(true);
  };
  const openLogin = () => {
    closeAll();
    setShowLogin(true);
  };

  return (
    <OverlayContext.Provider
      value={{

        showLanguage,
        showState,
        showFeedback,
        showLogin,
    openLanguage,
        openState,
        openFeedback,
        openLogin,
        closeAll,
        bootstrapped,
      }}
    >
      {children}
    </OverlayContext.Provider>
  );
}

export function useOverlay() {
  return useContext(OverlayContext);
}
