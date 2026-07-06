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

const QR_STEPS = [
  "Open WhatsApp on your phone",
  "Tap Menu ⋮ or Settings → Linked devices",
  "Tap Link a device and scan this code",
];

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
  const hasQr = Boolean(session?.qr);
  const hasPairingCode = Boolean(session?.pairingCode);
  const showScanUi = hasQr || hasPairingCode;

  return (
    <div className="wa-connect-screen">
      <div className={`wa-connect-card${showScanUi ? " wa-connect-card--scan" : ""}`}>
        <div className="wa-connect-header">
          <div className="wa-connect-logo" aria-hidden>
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.53 5.855L0 24l6.335-1.662A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82a9.82 9.82 0 0 1-5.01-1.37l-.36-.214-3.76.987 1.004-3.66-.234-.375A9.82 9.82 0 0 1 2.18 12C2.18 6.57 6.57 2.18 12 2.18S21.82 6.57 21.82 12 17.43 21.82 12 21.82z" />
            </svg>
          </div>
          <h1 className="wa-connect-title">
            {showScanUi ? "Scan to connect" : "Connect WhatsApp"}
          </h1>
          <p className="wa-connect-subtitle">
            {showScanUi
              ? "Point your phone at the code below to link your account."
              : "Link your WhatsApp account to sync chats, messages, and contacts."}
          </p>
        </div>

        {!showScanUi ? (
          <div className="wa-connect-status">
            Status:{" "}
            <strong className="wa-connect-status__value">{status.replace("_", " ")}</strong>
          </div>
        ) : (
          <div className="wa-connect-status wa-connect-status--live">
            <span className="wa-connect-status__dot" />
            Waiting for scan
          </div>
        )}

        {error ? (
          <div className="wa-connect-alert">
            <DismissibleAlert message={error} onDismiss={() => onDismissError?.()} />
          </div>
        ) : null}

        {showSessionError ? (
          <div className="wa-connect-alert">
            <DismissibleAlert
              message={session!.lastError!}
              onDismiss={() => setDismissedSessionError(true)}
            />
          </div>
        ) : null}

        {session?.loadingPercent !== null && session?.loadingPercent !== undefined && !showScanUi ? (
          <div className="wa-connect-progress">
            Syncing WhatsApp… {session.loadingPercent}%
          </div>
        ) : null}

        {hasQr ? (
          <div className="wa-connect-scan">
            <div className="wa-connect-qr">
              <div className="wa-connect-qr__frame">
                <div className="wa-connect-qr__glow" aria-hidden />
                <div className="wa-connect-qr__canvas">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${encodeURIComponent(session!.qr!)}`}
                    alt="WhatsApp QR code"
                    width={260}
                    height={260}
                    className="wa-connect-qr__image"
                  />
                </div>
              </div>
            </div>
            <ol className="wa-connect-steps">
              {QR_STEPS.map((step, i) => (
                <li key={step} className="wa-connect-steps__item">
                  <span className="wa-connect-steps__num">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        {hasPairingCode ? (
          <div className="wa-connect-pairing">
            <p className="wa-connect-pairing__label">Enter this pairing code on your phone</p>
            <code className="wa-connect-pairing__code">{session!.pairingCode}</code>
          </div>
        ) : null}

        <div className="wa-connect-actions">
          <button
            type="button"
            className="wa-connect-btn wa-connect-btn--primary"
            onClick={onConnect}
            disabled={connecting || status === "initializing"}
          >
            {connecting || status === "initializing"
              ? "Starting session…"
              : status === "qr"
                ? "Refresh QR"
                : "Connect WhatsApp"}
          </button>

          <button type="button" className="wa-connect-btn wa-connect-btn--secondary" onClick={onRefresh}>
            Refresh status
          </button>
        </div>

     
      </div>
    </div>
  );
}
