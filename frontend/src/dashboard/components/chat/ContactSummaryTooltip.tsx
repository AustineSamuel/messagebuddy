"use client";

import { createPortal } from "react-dom";
import type { ContactSummaryResponse } from "@/whatsappjs-services/contact-summary-types";

type Props = {
  summary: ContactSummaryResponse | null | undefined;
  contactName: string;
  anchor: { top: number; left: number };
  visible: boolean;
};

export default function ContactSummaryTooltip({
  summary,
  contactName,
  anchor,
  visible,
}: Props) {
  const text = summary?.summaryText?.trim();
  if (!visible || !text || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="tooltip"
      style={{
        position: "fixed",
        top: anchor.top,
        left: anchor.left,
        zIndex: 9999,
        width: 280,
        maxWidth: "min(280px, calc(100vw - 24px))",
        padding: "12px 14px",
        borderRadius: 10,
        background: "var(--bg-3)",
        border: "1px solid var(--border-2)",
        boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
        pointerEvents: "none",
        fontFamily: "var(--font-sans)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "var(--wa-green)",
          textTransform: "uppercase",
          letterSpacing: "0.4px",
          marginBottom: 6,
        }}
      >
        Contact summary
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-0)", marginBottom: 6 }}>
        {contactName}
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 12,
          lineHeight: 1.5,
          color: "var(--text-1)",
        }}
      >
        {text}
      </p>
    </div>,
    document.body
  );
}
