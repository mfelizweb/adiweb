"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

interface StateContextProps {
  region: string;
  state: string | null;
  states: string[];
  regions: string[];
  loading: boolean;
  selectRegion: (r: string) => Promise<void>;
  selectState: (s: string | null) => Promise<void>;
}

const StateContext = createContext<StateContextProps>({
  region: "Dominican Republic",
  state: null,
  states: [],
  regions: [],
  loading: false,
  selectRegion: async () => {},
  selectState: async () => {},
});

const REGION_KEY = "adi_appRegion";
const STATE_KEY = "adi_appState";

export function StateProvider({ children }: { children: ReactNode }) {
  const [region, setRegion] = useState<string>("Dominican Republic");
  const [state, setState] = useState<string | null>(null);
  const [states, setStates] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedRegion = localStorage.getItem(REGION_KEY);
      const savedState = localStorage.getItem(STATE_KEY);
      if (savedRegion) setRegion(savedRegion);
      if (savedState) setState(savedState);
    } catch (err) {
      console.error("Error loading region/state:", err);
    }
  }, []);

  useEffect(() => {
    const fetchRegions = async () => {
      const { data, error } = await supabase.from("places").select("region");
      if (!error && data) {
        const distinct = Array.from(new Set(data.map((p: any) => p.region)))
          .filter(Boolean)
          .sort();
        setRegions(distinct);
      }
    };
    fetchRegions();
  }, []);

  useEffect(() => {
    if (!region) return;
    const fetchStates = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("places")
        .select("state")
        .eq("region", region)
        .not("state", "is", null);
      if (!error && data) {
        const distinct = Array.from(new Set(data.map((p: any) => p.state)))
          .filter(Boolean)
          .sort();
        setStates(distinct);
      }
      setLoading(false);
    };
    fetchStates();
  }, [region]);

  const selectRegion = async (r: string) => {
    setRegion(r);
    setState(null);
    localStorage.setItem(REGION_KEY, r);
    localStorage.removeItem(STATE_KEY);
  };

  const selectState = async (s: string | null) => {
    setState(s);
    if (s) localStorage.setItem(STATE_KEY, s);
    else localStorage.removeItem(STATE_KEY);
  };

  return (
    <StateContext.Provider
      value={{
        region,
        state,
        states,
        regions,
        loading,
        selectRegion,
        selectState,
      }}
    >
      {children}
    </StateContext.Provider>
  );
}

export function useStateContext() {
  return useContext(StateContext);
}
