"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

const STORAGE_KEY = "nawaa-locale";

export function getStoredLocale(): "en" | "ar" {
  if (typeof window === "undefined") return "ar";
  const s = window.localStorage.getItem(STORAGE_KEY);
  return s === "en" || s === "ar" ? s : "ar";
}

export function setStoredLocale(locale: "en" | "ar") {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, locale);
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
}

/**
 * Single source of truth for locale hydration.
 * Reads from localStorage once on mount and syncs to Zustand store.
 * Individual pages should NOT set document.lang/dir themselves — the store handles it.
 */
export default function LocaleSync() {
  const setLocale = useAppStore((s) => s.setLocale);

  useEffect(() => {
    const stored = getStoredLocale();
    // Sync store — store's setLocale also sets document.lang/dir
    setLocale(stored);
  }, [setLocale]);

  return null;
}
