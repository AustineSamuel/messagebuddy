"use client";

import { useState } from "react";
import { usePwaInstall } from "@/app/hooks/usePwaInstall";

type Variant = "sidebar" | "header" | "settings";

type Props = {
  variant?: Variant;
};

export default function InstallAppButton({ variant = "sidebar" }: Props) {
  const { canInstall, canShowIosHint, isInstalled, isInstalling, install } = usePwaInstall();
  const [showIosHint, setShowIosHint] = useState(false);

  if (isInstalled) return null;

  if (variant === "sidebar") {
    if (!canInstall && !canShowIosHint) return null;

    return (
      <div
        style={{
          marginTop: "auto",
          marginBottom: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          position: "relative",
        }}
      >
        {canInstall ? (
          <button
            type="button"
            title="Install app"
            onClick={() => void install()}
            disabled={isInstalling}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              border: "1px solid var(--border-2)",
              background: "var(--bg-2)",
              color: "var(--wa-green)",
              cursor: isInstalling ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={18} height={18}>
              <path d="M12 3v12" />
              <path d="M8 11l4 4 4-4" />
              <path d="M4 21h16" />
            </svg>
          </button>
        ) : null}
        {canShowIosHint ? (
          <button
            type="button"
            title="Add to Home Screen"
            onClick={() => setShowIosHint((prev) => !prev)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              border: "1px solid var(--border-2)",
              background: "var(--bg-2)",
              color: "var(--wa-green)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={18} height={18}>
              <rect x="5" y="2" width="14" height="20" rx="2" />
              <path d="M12 18h.01" />
            </svg>
          </button>
        ) : null}
        {showIosHint ? (
          <div
            style={{
              position: "absolute",
              left: 76,
              bottom: 72,
              width: 220,
              padding: "10px 12px",
              borderRadius: 10,
              background: "var(--bg-1)",
              border: "1px solid var(--border-1)",
              color: "var(--text-1)",
              fontSize: 11,
              lineHeight: 1.45,
              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
              zIndex: 200,
            }}
          >
            Tap the Share button in Safari, then choose <strong>Add to Home Screen</strong>.
          </div>
        ) : null}
      </div>
    );
  }

  if (variant === "header") {
    if (!canInstall && !canShowIosHint) return null;

    return (
      <button
        type="button"
        onClick={() => (canInstall ? void install() : setShowIosHint(true))}
        disabled={isInstalling}
        className="rounded-full border border-[#2d7a4f] px-5 py-2 text-[11px] font-semibold text-[#1a5c3a] transition hover:bg-[#e8f5eb]"
      >
        {isInstalling ? "Installing…" : "Install app"}
      </button>
    );
  }

  // settings variant — full-width card button
  if (!canInstall && !canShowIosHint) {
    return (
      <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>
        MessageBuddy is already installed on this device, or your browser does not support install prompts here.
      </p>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => (canInstall ? void install() : setShowIosHint(true))}
        disabled={isInstalling}
        style={{
          width: "100%",
          padding: "12px 16px",
          borderRadius: 10,
          border: "1px solid var(--wa-green)",
          background: "var(--wa-green-glow)",
          color: "var(--wa-green)",
          fontSize: 13,
          fontWeight: 700,
          cursor: isInstalling ? "wait" : "pointer",
          fontFamily: "var(--font-sans)",
        }}
      >
        {isInstalling ? "Installing…" : "Install MessageBuddy app"}
      </button>
      {showIosHint || canShowIosHint ? (
        <p style={{ marginTop: 8, fontSize: 11, color: "var(--text-2)", lineHeight: 1.5 }}>
          On iPhone/iPad: open in Safari, tap Share, then <strong>Add to Home Screen</strong>.
        </p>
      ) : null}
    </div>
  );
}
