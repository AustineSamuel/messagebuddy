"use client";

import Image from "next/image";
import { useState } from "react";
import InstallAppButton from "@/app/components/InstallAppButton";
import { Avatar } from "@/dashboard/components/ui/primitives";
import type { NavView } from "@/dashboard/types";

const NAV_ITEMS: {
  view: NavView;
  title: string;
  badge?: number;
  icon: React.ReactNode;
}[] = [
  {
    view: "chats",
    title: "Chats",
    badge: 6,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={20} height={20}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    view: "credits",
    title: "Buy Credits",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={20} height={20}>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
        <circle cx="7" cy="15" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    view: "dashboard",
    title: "Analytics",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={20} height={20}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    view: "followups",
    title: "AI Follow-ups",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={20} height={20}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    view: "products",
    title: "Products",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={20} height={20}>
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    view: "contacts",
    title: "Contacts & Rules",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={20} height={20}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    view: "website",
    title: "Get Website",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={20} height={20}>
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    view: "settings",
    title: "Business Settings",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={20} height={20}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

interface SidebarProps {
  activeView: NavView;
  onNavigate: (view: NavView) => void;
}

function SidebarNavItem({
  title,
  isActive,
  badge,
  onClick,
  children,
}: {
  title: string;
  isActive: boolean;
  badge?: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={title}
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          border: "none",
          background: isActive ? "var(--wa-green)" : hovered ? "var(--bg-3)" : "transparent",
          color: isActive ? "#fff" : hovered ? "var(--text-0)" : "var(--text-2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          position: "relative",
          transition: "all 0.15s",
          flexShrink: 0,
        }}
      >
        {children}
        {badge && !isActive ? (
          <span
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              background: "var(--red)",
              color: "#fff",
              borderRadius: 99,
              fontSize: 9,
              fontWeight: 700,
              width: 14,
              height: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {badge}
          </span>
        ) : null}
      </button>

      <span
        role="tooltip"
        style={{
          position: "absolute",
          left: "calc(100% + 10px)",
          top: "50%",
          transform: `translateY(-50%) translateX(${hovered ? 0 : -4}px)`,
          padding: "6px 10px",
          borderRadius: 8,
          background: "var(--bg-3)",
          border: "1px solid var(--border-2)",
          color: "var(--text-0)",
          fontSize: 12,
          fontWeight: 600,
          whiteSpace: "nowrap",
          pointerEvents: "none",
          opacity: hovered ? 1 : 0,
          visibility: hovered ? "visible" : "hidden",
          transition: "opacity 0.15s ease, transform 0.15s ease, visibility 0.15s",
          zIndex: 100,
          boxShadow: "0 8px 24px rgba(0,0,0,0.28)",
          fontFamily: "var(--font-sans)",
        }}
      >
        {title}
      </span>
    </div>
  );
}

export default function Sidebar({ activeView, onNavigate }: SidebarProps) {
  return (
    <nav
      style={{
        width: 68,
        background: "var(--bg-1)",
        borderRight: "1px solid var(--border-1)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "16px 0",
        gap: 6,
        flexShrink: 0,
        zIndex: 20,
        overflow: "visible",
        position: "relative",
      }}
    >
      {/* Logo */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          overflow: "hidden",
          marginBottom: 10,
          flexShrink: 0,
          boxShadow: "0 4px 12px rgba(37,211,102,0.25)",
        }}
      >
        <Image
          src="/icon.png"
          alt="MessageBuddy"
          width={40}
          height={40}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          priority
        />
      </div>

      {/* Nav items */}
      {NAV_ITEMS.map((item) => {
        const isActive = activeView === item.view;
        return (
          <SidebarNavItem
            key={item.view}
            title={item.title}
            isActive={isActive}
            badge={item.badge}
            onClick={() => onNavigate(item.view)}
          >
            {item.icon}
          </SidebarNavItem>
        );
      })}

      <InstallAppButton variant="sidebar" />

      {/* User avatar at bottom */}
      <div style={{ marginBottom: 4 }}>
        <Avatar initials="OB" color="#1e2d44" size={36} />
      </div>
    </nav>
  );
}
