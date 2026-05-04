"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { DisplayCurrencyMode } from "@/lib/price-format";

const STORAGE_KEY = "qgb-display-currency";

function readStored(): DisplayCurrencyMode {
  if (typeof window === "undefined") return "BOTH";
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "SAR" || v === "YER" || v === "BOTH") return v;
  } catch {
    /* ignore */
  }
  return "BOTH";
}

type CurrencyContextValue = {
  mode: DisplayCurrencyMode;
  setMode: (m: DisplayCurrencyMode) => void;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<DisplayCurrencyMode>("BOTH");

  useEffect(() => {
    setModeState(readStored());
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || e.newValue == null) return;
      if (e.newValue === "SAR" || e.newValue === "YER" || e.newValue === "BOTH") {
        setModeState(e.newValue);
      }
    };
    const onCustom = () => setModeState(readStored());
    window.addEventListener("storage", onStorage);
    window.addEventListener("qgb-currency-change", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("qgb-currency-change", onCustom);
    };
  }, []);

  const setMode = useCallback((m: DisplayCurrencyMode) => {
    setModeState(m);
    try {
      localStorage.setItem(STORAGE_KEY, m);
      window.dispatchEvent(new CustomEvent("qgb-currency-change"));
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => ({ mode, setMode }), [mode, setMode]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useDisplayCurrency(): DisplayCurrencyMode {
  const ctx = useContext(CurrencyContext);
  return ctx?.mode ?? "BOTH";
}

export function useDisplayCurrencyControls(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  return ctx ?? { mode: "BOTH", setMode: () => {} };
}
