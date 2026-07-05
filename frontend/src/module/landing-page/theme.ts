"use client";

const STORAGE_KEY = "landing-theme";

export type LandingTheme = "dark" | "light";

export function getStoredLandingTheme(): LandingTheme {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "light" ? "light" : "dark";
}

export function storeLandingTheme(theme: LandingTheme) {
  window.localStorage.setItem(STORAGE_KEY, theme);
}
