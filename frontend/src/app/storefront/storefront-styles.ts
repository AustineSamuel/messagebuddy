import type { CSSProperties } from "react";

/** Shared storefront palette — white surfaces, black text, green accents. */
export const STORE = {
  pageBg: "#eaeded",
  white: "#ffffff",
  text: "#0f1111",
  textSecondary: "#565959",
  textMuted: "#888c8c",
  border: "#d5d9d9",
  borderLight: "#e7e7e7",
  green: "#067d62",
  greenBright: "#25D366",
  successBg: "#f0faf6",
  warning: "#c45500",
  danger: "#b12704",
  footerBg: "#232f3e",
  footerText: "#cccccc",
} as const;

export function storeGreen(accent?: string | null) {
  return accent?.trim() || STORE.green;
}

export function accentRgb(hex: string) {
  const raw = hex.replace("#", "");
  if (raw.length !== 6) return "6, 125, 98";
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return "6, 125, 98";
  return `${r}, ${g}, ${b}`;
}

export function storefrontPageStyle(): CSSProperties {
  return {
    minHeight: "100vh",
    background: STORE.pageBg,
    color: STORE.text,
    fontFamily: "var(--font-geist-sans, Arial, Helvetica, sans-serif)",
  };
}

export const storefrontShellStyle: CSSProperties = {
  width: "100%",
  maxWidth: 1200,
  margin: "0 auto",
  padding: "0 20px 48px",
};

export function storefrontTopBarStyle(): CSSProperties {
  return {
    background: STORE.white,
    borderBottom: `1px solid ${STORE.border}`,
    boxShadow: "0 2px 4px rgba(15,17,17,0.06)",
  };
}

export function storefrontHeaderInnerStyle(): CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
    padding: "14px 0",
  };
}

export function storefrontHeroStyle(): CSSProperties {
  return {
    background: STORE.white,
    borderBottom: `1px solid ${STORE.borderLight}`,
    padding: "32px 0",
    marginBottom: 8,
  };
}

export const productGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  gap: 16,
};

export const sectionTitleStyle: CSSProperties = {
  fontSize: 21,
  fontWeight: 700,
  color: STORE.text,
  marginBottom: 16,
  paddingBottom: 8,
  borderBottom: `1px solid ${STORE.borderLight}`,
};

export const sectionBlockStyle: CSSProperties = {
  background: STORE.white,
  border: `1px solid ${STORE.border}`,
  borderRadius: 8,
  padding: 24,
};

export function pillStyle(variant: "in" | "low" | "out" | "neutral" | "green"): CSSProperties {
  const map = {
    in: { bg: STORE.successBg, color: STORE.green, border: "#a7d4c4" },
    low: { bg: "#fff8f0", color: STORE.warning, border: "#f0c14b" },
    out: { bg: "#fff5f5", color: STORE.danger, border: "#f5c6cb" },
    neutral: { bg: "#f7fafa", color: STORE.textSecondary, border: STORE.borderLight },
    green: { bg: STORE.successBg, color: STORE.green, border: "#a7d4c4" },
  };
  const s = map[variant];
  return {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 600,
    background: s.bg,
    color: s.color,
    border: `1px solid ${s.border}`,
  };
}

export function primaryBtnStyle(accent: string, disabled?: boolean): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "10px 18px",
    borderRadius: 8,
    border: "none",
    background: disabled ? "#adb1b8" : accent,
    color: STORE.white,
    fontWeight: 600,
    fontSize: 14,
    cursor: disabled ? "not-allowed" : "pointer",
    textDecoration: "none",
    boxShadow: disabled ? "none" : "0 2px 5px rgba(15,17,17,0.15)",
  };
}

export function secondaryBtnStyle(accent: string): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "9px 14px",
    borderRadius: 8,
    border: `1px solid ${STORE.border}`,
    background: `linear-gradient(to bottom, ${STORE.white}, #f7fafa)`,
    color: STORE.text,
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    textDecoration: "none",
  };
}

export function outlineGreenBtnStyle(accent: string): CSSProperties {
  return {
    ...secondaryBtnStyle(accent),
    border: `1px solid ${accent}`,
    color: accent,
    background: STORE.white,
  };
}

export function productCardStyle(): CSSProperties {
  return {
    display: "flex",
    flexDirection: "column",
    background: STORE.white,
    border: `1px solid ${STORE.border}`,
    borderRadius: 8,
    overflow: "hidden",
    textDecoration: "none",
    color: "inherit",
    transition: "box-shadow 0.15s ease, border-color 0.15s ease",
  };
}

export function buyBoxStyle(): CSSProperties {
  return {
    padding: 20,
    borderRadius: 8,
    background: STORE.white,
    border: `1px solid ${STORE.border}`,
    boxShadow: "0 2px 8px rgba(15,17,17,0.08)",
  };
}

export function storefrontFooterStyle(): CSSProperties {
  return {
    marginTop: 32,
    padding: "24px 0",
    background: STORE.footerBg,
    color: STORE.footerText,
    fontSize: 12,
    textAlign: "center",
  };
}
