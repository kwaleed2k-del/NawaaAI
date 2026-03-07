"use client";

import { useEffect } from "react";

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

export default function LocaleSync() {
  useEffect(() => {
    const locale = getStoredLocale();
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, []);
  return null;
}
