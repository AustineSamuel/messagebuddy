"use client";

import DismissibleAlert from "@/dashboard/components/ui/DismissibleAlert";
import type { WhatsAppSession } from "@/whatsappjs-services/session";

type Props = {
  session: WhatsAppSession | null;
  error?: string | null;
  onRefresh: () => void;
  onRetry?: () => void;
};

function statusLabel(status: string) {
  switch (status) {
    case "authenticated":
      return "Authenticated — finishing setup…";
    case "initializing":
      return "Loading WhatsApp Web…";
    default:
      return "Starting WhatsApp session…";
  }
}

export default function WhatsAppSyncingScreen({
  session,
  error,
  onRefresh,
  onRetry,
}: Props) {
  const status = session?.status ?? "initializing";
  const rawPercent = session?.loadingPercent;
  const percent =
    rawPercent !== null && rawPercent !== undefined
      ? Math.min(100, Math.max(1, Math.round(rawPercent)))
      : null;

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
            Syncing WhatsApp
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-2)", marginTop: 8 }}>
            {statusLabel(status)}
          </p>
        </div>

        {error || session?.lastError ? (
          <div style={{ marginBottom: 16 }}>
            <DismissibleAlert message={error ?? session?.lastError ?? ""} onDismiss={() => {}} />
          </div>
        ) : null}

        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              color: "var(--text-2)",
              marginBottom: 8,
            }}
          >
            <span>Progress</span>
            <span>{percent !== null ? `${percent}%` : "Starting…"}</span>
          </div>
          <div
            style={{
              height: 8,
              borderRadius: 99,
              background: "var(--bg-3)",
              overflow: "hidden",
            }}
          >
            <div
              className={percent === null ? "wa-progress-indeterminate" : undefined}
              style={{
                height: "100%",
                width: percent !== null ? `${percent}%` : "35%",
                borderRadius: 99,
                background: "linear-gradient(90deg, var(--wa-green), #34d399)",
                transition: "width 0.45s ease",
              }}
            />
          </div>
        </div>

        <p style={{ fontSize: 12, color: "var(--text-3)", textAlign: "center", marginBottom: 16 }}>
          Status:{" "}
          <strong style={{ color: "var(--wa-green)", textTransform: "capitalize" }}>
            {status.replace("_", " ")}
          </strong>
        </p>

        <p style={{ fontSize: 11, color: "var(--text-3)", textAlign: "center", marginBottom: 16 }}>
          First connect can take 1–2 minutes while the server starts Chromium. If it takes
          longer, use Stop and try again.
        </p>

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
            marginBottom: onRetry ? 10 : 0,
          }}
        >
          Refresh status
        </button>

        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            style={{
              width: "100%",
              padding: "10px 16px",
              borderRadius: 10,
              border: "none",
              background: "var(--wa-green)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Stop and try again
          </button>
        ) : null}
      </div>
    </div>
  );
}
