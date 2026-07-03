"use client";

import { useCallback, useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { shareStoreUrl } from "@/app/lib/share-store";
import "./storefront.css";

type Props = {
  url: string;
  businessName: string;
  accent?: string;
};

function QrIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 4h6v6H4V4zm2 2v2h2V6H6zm8-2h6v6h-6V4zm2 2v2h2V6h-2zM4 14h6v6H4v-6zm2 2v2h2v-2H6zm8 2h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2zm4 0h2v2h-2v-2zm4-8h2v6h-2v-6zm0 8h2v2h-2v-2z"
        fill="currentColor"
      />
    </svg>
  );
}

function StoreQrModal({
  open,
  url,
  businessName,
  onClose,
}: {
  open: boolean;
  url: string;
  businessName: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Store QR code"
      onClick={onClose}
      className="sf-modal-backdrop fixed inset-0 z-[100] flex items-center justify-center p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="sf-band w-full max-w-sm bg-white p-6 text-center sf-rise"
      >
        <h2 className="mb-1 text-lg font-bold text-gray-900">Scan to visit {businessName}</h2>
        <p className="mb-5 text-sm text-gray-500">Open your camera and scan this code.</p>
        <div className="mb-4 inline-block rounded-2xl border border-gray-100 bg-white p-4 shadow-inner">
          <QRCodeSVG value={url} size={200} level="M" includeMargin={false} />
        </div>
        <p className="mb-5 break-all text-xs text-gray-400">{url}</p>
        <button type="button" onClick={onClose} className="sf-btn-secondary w-full">
          Close
        </button>
      </div>
    </div>
  );
}

export default function StorefrontHeaderShare({ url, businessName }: Props) {
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const closeQr = useCallback(() => setQrOpen(false), []);

  const handleShare = async () => {
    setSharing(true);
    try {
      await shareStoreUrl(url, businessName);
    } finally {
      setSharing(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy store link:", url);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2" aria-label="Share this store">
        <button
          type="button"
          onClick={() => setQrOpen(true)}
          className="sf-btn-secondary !px-3"
          aria-label="Show store QR code"
          title="QR code"
        >
          <QrIcon />
        </button>
        <button
          type="button"
          onClick={() => void handleShare()}
          disabled={sharing}
          className="sf-btn-secondary"
        >
          {sharing ? "…" : "Share"}
        </button>
        <button type="button" onClick={() => void handleCopy()} className="sf-btn-secondary hidden sm:inline-flex">
          {copied ? "Copied ✓" : "Copy link"}
        </button>
      </div>

      <StoreQrModal open={qrOpen} url={url} businessName={businessName} onClose={closeQr} />
    </>
  );
}
