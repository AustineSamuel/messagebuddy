"use client";

import { useState } from "react";
import DismissibleAlert from "@/dashboard/components/ui/DismissibleAlert";
import type { WhatsAppSession } from "@/whatsappjs-services/session";

type Props = {
  session: WhatsAppSession | null;
  connecting: boolean;
  error: string | null;
  onConnect: () => void;
  onRefresh: () => void;
  onDismissError?: () => void;
};

export default function WhatsAppConnectScreen({
  session,
  connecting,
  error,
  onConnect,
  onRefresh,
  onDismissError,
}: Props) {
  const status = session?.status ?? "disconnected";
  const [dismissedSessionError, setDismissedSessionError] = useState(false);

  const showSessionError = session?.lastError && !dismissedSessionError;

  return (
    <div
      className="flex min-h-screen items-center justify-center px-6"
      style={{ background: "var(--bg-base)", fontFamily: "var(--font-sans)" }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--surface-1)",
          border: "1px solid var(--border-1)",
          borderRadius: 16,
          padding: 28,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "var(--wa-green-glow)",
              color: "var(--wa-green)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: 28,
            }}
          >
            ⬤
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-0)" }}>
            Connect WhatsApp
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-2)", marginTop: 8 }}>
            Link your WhatsApp account to sync chats, messages, and contacts.
          </p>
        </div>

        <div
          style={{
            marginBottom: 16,
            padding: "10px 14px",
            borderRadius: 10,
            background: "var(--bg-2)",
            border: "1px solid var(--border-1)",
            fontSize: 12,
            color: "var(--text-1)",
          }}
        >
          Status:{" "}
          <strong style={{ color: "var(--wa-green)", textTransform: "capitalize" }}>
            {status.replace("_", " ")}
          </strong>
        </div>

        {error ? (
          <div style={{ marginBottom: 12 }}>
            <DismissibleAlert message={error} onDismiss={() => onDismissError?.()} />
          </div>
        ) : null}

        {showSessionError ? (
          <div style={{ marginBottom: 12 }}>
            <DismissibleAlert
              message={session!.lastError!}
              onDismiss={() => setDismissedSessionError(true)}
            />
          </div>
        ) : null}

        {session?.loadingPercent !== null && session?.loadingPercent !== undefined ? (
          <div
            style={{
              marginBottom: 16,
              padding: "10px 14px",
              borderRadius: 10,
              background: "var(--bg-2)",
              fontSize: 12,
              color: "var(--text-2)",
            }}
          >
            Syncing WhatsApp… {session.loadingPercent}%
          </div>
        ) : null}

        {session?.qr ? (
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 12 }}>
              Scan with WhatsApp → Linked devices
            </p>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(session.qr)}`}
              alt="WhatsApp QR code"
              width={220}
              height={220}
              style={{ borderRadius: 12, border: "1px solid var(--border-1)" }}
            />
          </div>
        ) : null}

        {session?.pairingCode ? (
          <div
            style={{
              textAlign: "center",
              marginBottom: 16,
              padding: 16,
              borderRadius: 12,
              background: "var(--bg-2)",
            }}
          >
            <p style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 8 }}>
              Pairing code
            </p>
            <code style={{ fontSize: 24, letterSpacing: 6, color: "var(--wa-green)" }}>
              {session.pairingCode}
            </code>
          </div>
        ) : null}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            type="button"
            onClick={onConnect}
            disabled={connecting || status === "initializing"}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 10,
              border: "none",
              background: "var(--wa-green)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              cursor: connecting ? "wait" : "pointer",
              opacity: connecting ? 0.7 : 1,
            }}
          >
            {connecting || status === "initializing"
              ? "Starting session…"
              : status === "qr"
                ? "Refresh QR"
                : "Connect WhatsApp"}
          </button>

          <button
            type="button"
            onClick={onRefresh}
            style={{
              width: "100%",
              padding: "10px 16px",
              borderRadius: 10,
              border: "1px solid var(--border-1)",
              background: "transparent",
              color: "var(--text-1)",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Refresh status
          </button>
        </div>

        <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 16, textAlign: "center" }}>
          Uses whatsapp-web.js via your backend. Keep the server running while connected.
        </p>
      </div>
    </div>
  );
}
