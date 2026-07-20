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
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect x="10" y="16" width="28" height="22" rx="6" fill="currentColor" opacity="0.15" />
      <rect x="10" y="16" width="28" height="22" rx="6" stroke="currentColor" strokeWidth="2.2" />
      <path d="M24 8v8M16 12h16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="19" cy="26" r="2.5" fill="currentColor" />
      <circle cx="29" cy="26" r="2.5" fill="currentColor" />
      <path d="M18 33h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function IconShop({ className = defaults }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path d="M10 18h28l-2 22H12L10 18z" fill="currentColor" opacity="0.15" />
      <path d="M10 18h28l-2 22H12L10 18z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M16 18V14a8 8 0 0 1 16 0v4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M18 26h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
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
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect x="6" y="18" width="36" height="24" rx="3" fill="currentColor" opacity="0.12" />
      <path
        d="M8 18h32l-2.2 22.5a3 3 0 0 1-3 2.5H13.2a3 3 0 0 1-3-2.5L8 18z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M10 18l2.5-7.5A3 3 0 0 1 15.3 8h17.4a3 3 0 0 1 2.8 2.5L38 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M18 18V12a6 6 0 0 1 12 0v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="18" y="28" width="12" height="15" rx="1.5" fill="currentColor" opacity="0.85" />
      <circle cx="27.5" cy="36" r="1.2" fill="var(--lp-bg, #fff)" />
    </svg>
  );
}

export function IconSparkles({ className = defaults }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M24 6l3.2 9.8L37 19l-9.8 3.2L24 32l-3.2-9.8L11 19l9.8-3.2L24 6z"
        fill="currentColor"
        opacity="0.95"
      />
      <path
        d="M36 28l1.8 5.4L43 35.2l-5.2 1.8L36 42.4l-1.8-5.4L29 35.2l5.2-1.8L36 28z"
        fill="currentColor"
        opacity="0.7"
      />
      <path
        d="M12 30l1.3 3.8L17 35.1l-3.7 1.3L12 40.2l-1.3-3.8L7 35.1l3.7-1.3L12 30z"
        fill="currentColor"
        opacity="0.55"
      />
    </svg>
  );
}

export function IconZap({ className = defaults }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M27 4L12 26h9.5L19 44l19-24h-10L27 4z"
        fill="currentColor"
        opacity="0.95"
      />
      <path
        d="M27 4L12 26h9.5L19 44l19-24h-10L27 4z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity="0.35"
      />
    </svg>
  );
}

export function IconMessages({ className = defaults }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M10 10h28a4 4 0 0 1 4 4v16a4 4 0 0 1-4 4H20l-8 7V14a4 4 0 0 1 4-4z"
        fill="currentColor"
        opacity="0.15"
      />
      <path
        d="M10 10h28a4 4 0 0 1 4 4v16a4 4 0 0 1-4 4H20l-8 7V14a4 4 0 0 1 4-4z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M16 20h16M16 27h10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function IconRepeat({ className = defaults }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path d="M34 8l7 7-7 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 22V18a10 10 0 0 1 10-10h21" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M14 40l-7-7 7-7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M38 26v4a10 10 0 0 1-10 10H7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="24" cy="24" r="4" fill="currentColor" opacity="0.85" />
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
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="18" cy="16" r="7" fill="currentColor" opacity="0.9" />
      <path d="M6 38c0-7 5.4-12 12-12s12 5 12 12" fill="currentColor" opacity="0.2" />
      <path d="M6 38c0-7 5.4-12 12-12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="33" cy="18" r="5.5" fill="currentColor" opacity="0.65" />
      <path d="M28 38c.6-4.8 4.2-8 8.5-8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function IconClock({ className = defaults }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="24" cy="24" r="18" fill="currentColor" opacity="0.12" />
      <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2.2" />
      <path d="M24 14v11l7 4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="24" r="2" fill="currentColor" />
    </svg>
  );
}

export function IconClipboard({ className = defaults }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect x="12" y="10" width="24" height="32" rx="4" fill="currentColor" opacity="0.12" />
      <rect x="12" y="10" width="24" height="32" rx="4" stroke="currentColor" strokeWidth="2.2" />
      <rect x="17" y="6" width="14" height="7" rx="2" fill="currentColor" opacity="0.85" />
      <path d="M18 22h12M18 28h12M18 34h8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function IconUserPlus({ className = defaults }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="18" cy="16" r="7" fill="currentColor" opacity="0.9" />
      <path d="M6 38c0-7 5.4-12 12-12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M6 38c0-7 5.4-12 12-12s8 2.5 10.5 6" fill="currentColor" opacity="0.15" />
      <path d="M34 16v12M28 22h12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function IconQr({ className = defaults }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect x="6" y="6" width="14" height="14" rx="3" fill="currentColor" opacity="0.9" />
      <rect x="28" y="6" width="14" height="14" rx="3" fill="currentColor" opacity="0.55" />
      <rect x="6" y="28" width="14" height="14" rx="3" fill="currentColor" opacity="0.55" />
      <path d="M28 28h6v6h-6zM38 28h4v12H30v-4" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
      <rect x="10" y="10" width="6" height="6" rx="1" fill="var(--lp-bg, #fff)" />
    </svg>
  );
}

export function IconRocket({ className = defaults }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M28 6c6 2 10 8 12 14-6 2-12 8-16 14l-8-8C22 20 26 12 28 6z"
        fill="currentColor"
        opacity="0.9"
      />
      <path d="M16 26l6 6-8 4 2-10z" fill="currentColor" opacity="0.55" />
      <circle cx="30" cy="16" r="2.5" fill="var(--lp-bg, #fff)" />
      <path d="M12 36c2-2 4-3 6-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
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
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect x="14" y="6" width="20" height="36" rx="5" fill="currentColor" opacity="0.12" />
      <rect x="14" y="6" width="20" height="36" rx="5" stroke="currentColor" strokeWidth="2.2" />
      <path d="M20 10h8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="24" cy="36" r="1.8" fill="currentColor" />
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
  size?: "sm" | "md" | "lg" | "xl";
};

export default function LandingIcon({ name, boxed = false, size = "md", className }: LandingIconProps) {
  const Icon = iconMap[name];
  const sizeClass =
    size === "xl"
      ? "h-10 w-10"
      : size === "lg"
        ? "h-7 w-7"
        : size === "sm"
          ? "h-4 w-4"
          : "h-5 w-5";

  const icon = <Icon className={className ?? sizeClass} />;

  if (!boxed) return icon;

  return (
    <span className={`lp-icon-box lp-icon-box--${size}`} aria-hidden>
      {icon}
    </span>
  );
}
