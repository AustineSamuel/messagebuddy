"use client";

import type { FC } from "react";

type IconProps = {
  className?: string;
};

const defaults = "h-5 w-5";

export function IconInbox({ className = defaults }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M4 6h16v12H4z" strokeLinejoin="round" />
      <path d="M4 8l8 5 8-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconBot({ className = defaults }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="5" y="8" width="14" height="11" rx="2" />
      <path d="M9 12h.01M15 12h.01M9 16h6" strokeLinecap="round" />
      <path d="M12 4v4M8 6h8" strokeLinecap="round" />
    </svg>
  );
}

export function IconShop({ className = defaults }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M4 9h16l-1.2 10H5.2L4 9z" strokeLinejoin="round" />
      <path d="M8 9V6a4 4 0 0 1 8 0v3" strokeLinecap="round" />
    </svg>
  );
}

export function IconChart({ className = defaults }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M4 19V5M4 19h16" strokeLinecap="round" />
      <path d="M8 15v-4M12 15V9M16 15v-7" strokeLinecap="round" />
    </svg>
  );
}

export function IconStore({ className = defaults }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M3 10h18M5 10V20h14V10M8 20v-6h8v6" strokeLinejoin="round" />
      <path d="M8 6h8l1 4H7l1-4z" strokeLinejoin="round" />
    </svg>
  );
}

export function IconSparkles({ className = defaults }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M12 3l1.4 4.3L18 9l-4.6 1.7L12 15l-1.4-4.3L6 9l4.6-1.7L12 3z" strokeLinejoin="round" />
      <path d="M19 14l.8 2.4L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.6L19 14z" strokeLinejoin="round" />
    </svg>
  );
}

export function IconZap({ className = defaults }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M13 2L4 14h7l-1 8 10-14h-7l0-6z" strokeLinejoin="round" />
    </svg>
  );
}

export function IconMessages({ className = defaults }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M7 10h10M7 14h6" strokeLinecap="round" />
      <path d="M5 5h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-4 3V7a2 2 0 0 1 2-2z" strokeLinejoin="round" />
    </svg>
  );
}

export function IconRepeat({ className = defaults }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M17 1l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

export function IconLayout({ className = defaults }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="3" y="3" width="8" height="18" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}

export function IconUsers({ className = defaults }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeLinecap="round" />
      <path d="M16 11a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM14.5 20c.3-2.2 2-4 4.5-4" strokeLinecap="round" />
    </svg>
  );
}

export function IconClock({ className = defaults }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" />
    </svg>
  );
}

export function IconClipboard({ className = defaults }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="7" y="4" width="10" height="17" rx="2" />
      <path d="M9 4h6a2 2 0 0 1 2 2v1H7V6a2 2 0 0 1 2-2z" />
    </svg>
  );
}

export function IconUserPlus({ className = defaults }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6" strokeLinecap="round" />
      <path d="M19 8v6M16 11h6" strokeLinecap="round" />
    </svg>
  );
}

export function IconQr({ className = defaults }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <path d="M14 14h2v2h-2zM18 14h2v6h-6v-2" strokeLinejoin="round" />
    </svg>
  );
}

export function IconSettings({ className = defaults }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeLinecap="round" />
    </svg>
  );
}

export function IconRocket({ className = defaults }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M12 3c3 4 4 8 4 12a4 4 0 0 1-8 0c0-4 1-8 4-12z" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="2" />
      <path d="M5 19l2-2M19 19l-2-2" strokeLinecap="round" />
    </svg>
  );
}

export function IconGift({ className = defaults }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="3" y="8" width="18" height="13" rx="1.5" />
      <path d="M12 8v13M3 12h18M8.5 8C7 8 5 7 5 5.5S6.5 3 8.5 3 12 8 12 8s-1.5-5-3.5-5S5 3 5 5.5 7 8 8.5 8zM15.5 8C17 8 19 7 19 5.5S17.5 3 15.5 3 12 8 12 8s1.5-5 3.5-5S19 3 19 5.5 17 8 15.5 8z" strokeLinejoin="round" />
    </svg>
  );
}

export function IconShield({ className = defaults }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconSmartphone({ className = defaults }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" strokeLinecap="round" />
    </svg>
  );
}

export function IconMail({ className = defaults }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" strokeLinejoin="round" />
    </svg>
  );
}

export function IconHelp({ className = defaults }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 4.8 1c0 2-3 2-3 4" strokeLinecap="round" />
      <circle cx="12" cy="17" r=".75" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconCheck({ className = defaults }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconGlobe({ className = defaults }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" strokeLinecap="round" />
    </svg>
  );
}

export type LandingIconName =
  | "inbox"
  | "bot"
  | "shop"
  | "chart"
  | "store"
  | "sparkles"
  | "zap"
  | "messages"
  | "repeat"
  | "layout"
  | "users"
  | "clock"
  | "clipboard"
  | "userPlus"
  | "qr"
  | "settings"
  | "rocket"
  | "gift"
  | "shield"
  | "smartphone"
  | "mail"
  | "help"
  | "check"
  | "globe";

const iconMap: Record<LandingIconName, FC<IconProps>> = {
  inbox: IconInbox,
  bot: IconBot,
  shop: IconShop,
  chart: IconChart,
  store: IconStore,
  sparkles: IconSparkles,
  zap: IconZap,
  messages: IconMessages,
  repeat: IconRepeat,
  layout: IconLayout,
  users: IconUsers,
  clock: IconClock,
  clipboard: IconClipboard,
  userPlus: IconUserPlus,
  qr: IconQr,
  settings: IconSettings,
  rocket: IconRocket,
  gift: IconGift,
  shield: IconShield,
  smartphone: IconSmartphone,
  mail: IconMail,
  help: IconHelp,
  check: IconCheck,
  globe: IconGlobe,
};

type LandingIconProps = IconProps & {
  name: LandingIconName;
  boxed?: boolean;
  size?: "sm" | "md" | "lg";
};

export default function LandingIcon({ name, boxed = false, size = "md", className }: LandingIconProps) {
  const Icon = iconMap[name];
  const sizeClass = size === "lg" ? "h-6 w-6" : size === "sm" ? "h-4 w-4" : "h-5 w-5";

  const icon = <Icon className={className ?? sizeClass} />;

  if (!boxed) return icon;

  return (
    <span className={`lp-icon-box lp-icon-box--${size}`} style={{maxWidth:40,fontSize:18,maxHeight:40}} aria-hidden>
      {icon}
    </span>
  );
}
