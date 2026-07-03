"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { shareStoreUrl } from "@/app/lib/share-store";
import { PrimaryBtn } from "@/dashboard/components/ui/primitives";

type Props = {
  url: string;
  businessName: string;
  onCopy: () => void | Promise<void>;
  linkCopied: boolean;
};

export default function StoreLinkShare({ url, businessName, onCopy, linkCopied }: Props) {
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    setSharing(true);
    try {
      await shareStoreUrl(url, businessName);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "stretch",
        gap: 16,
        flexWrap: "wrap",
        marginBottom: 14,
        padding: "14px 16px",
        borderRadius: "var(--radius-sm)",
        background: "rgba(37,211,102,0.08)",
        border: "1px solid rgba(37,211,102,0.25)",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          padding: 10,
          borderRadius: 12,
          background: "#fff",
          border: "1px solid rgba(0,0,0,0.06)",
          lineHeight: 0,
        }}
        aria-label="Store QR code"
      >
        <QRCodeSVG value={url} size={112} level="M" includeMargin={false} />
      </div>

      <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--wa-green)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 6,
          }}
        >
          Live store link
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text-0)",
            wordBreak: "break-all",
            marginBottom: 12,
            lineHeight: 1.45,
          }}
        >
          {url}
        </a>
        <p style={{ fontSize: 11, color: "var(--text-2)", marginBottom: 12, lineHeight: 1.45 }}>
          Scan the QR code or share the link — customers open your storefront on any phone.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <PrimaryBtn variant="green" onClick={() => void handleShare()} style={{ opacity: sharing ? 0.7 : 1 }}>
            {sharing ? "Opening…" : "Share"}
          </PrimaryBtn>
          <PrimaryBtn variant="green" onClick={() => void onCopy()}>
            {linkCopied ? "Copied ✓" : "Copy link"}
          </PrimaryBtn>
        </div>
      </div>
    </div>
  );
}
