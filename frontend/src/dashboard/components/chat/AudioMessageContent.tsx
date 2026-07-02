"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "@/app/lib/api";
import { downloadMessageMedia, transcribeMessage } from "@/whatsappjs-services/messages";

type Props = {
  messageId: string;
  caption?: string;
  isOut: boolean;
};

const TRANSCRIPTION_CACHE_PREFIX = "mb-transcription:";

function base64ToBlob(base64: string, mimeType: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

function readCachedTranscription(messageId: string) {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(`${TRANSCRIPTION_CACHE_PREFIX}${messageId}`);
  } catch {
    return null;
  }
}

function cacheTranscription(messageId: string, text: string) {
  try {
    window.sessionStorage.setItem(`${TRANSCRIPTION_CACHE_PREFIX}${messageId}`, text);
  } catch {
    // ignore quota errors
  }
}

export default function AudioMessageContent({ messageId, caption, isOut }: Props) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(true);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(() =>
    readCachedTranscription(messageId)
  );
  const [transcribing, setTranscribing] = useState(false);
  const [transcribeError, setTranscribeError] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoadingAudio(true);
      setAudioError(null);
      try {
        const media = await downloadMessageMedia(messageId);
        if (cancelled) return;
        const blob = base64ToBlob(media.data, media.mimetype || "audio/ogg");
        const url = URL.createObjectURL(blob);
        urlRef.current = url;
        setAudioUrl(url);
      } catch (err) {
        if (!cancelled) {
          setAudioError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) setLoadingAudio(false);
      }
    })();

    return () => {
      cancelled = true;
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
    };
  }, [messageId]);

  const handleTranscribe = useCallback(async () => {
    if (transcription || transcribing) return;
    setTranscribing(true);
    setTranscribeError(null);
    try {
      const result = await transcribeMessage(messageId);
      setTranscription(result.text);
      cacheTranscription(messageId, result.text);
    } catch (err) {
      setTranscribeError(getErrorMessage(err));
    } finally {
      setTranscribing(false);
    }
  }, [messageId, transcription, transcribing]);

  return (
    <div style={{ minWidth: 220, maxWidth: 280 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 8,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: isOut ? "rgba(255,255,255,0.12)" : "var(--wa-green-glow)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: isOut ? "#fff" : "var(--wa-green)",
            fontSize: 16,
          }}
          aria-hidden
        >
          🎤
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-2)", marginBottom: 4 }}>
            Voice message
          </div>
          {loadingAudio ? (
            <div style={{ fontSize: 12, color: "var(--text-2)" }}>Loading audio…</div>
          ) : audioError ? (
            <div style={{ fontSize: 12, color: "var(--red)" }}>{audioError}</div>
          ) : audioUrl ? (
            <audio
              controls
              preload="metadata"
              src={audioUrl}
              style={{
                width: "100%",
                height: 32,
                borderRadius: 8,
              }}
            />
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={() => void handleTranscribe()}
        disabled={transcribing || Boolean(transcription)}
        style={{
          width: "100%",
          padding: "7px 10px",
          borderRadius: 8,
          border: "1px solid var(--border-2)",
          background: transcription ? "var(--bg-3)" : "var(--bg-2)",
          color: transcription ? "var(--text-2)" : "var(--wa-green)",
          fontSize: 11,
          fontWeight: 700,
          cursor: transcription ? "default" : "pointer",
          fontFamily: "var(--font-sans)",
          opacity: transcribing ? 0.7 : 1,
        }}
      >
        {transcription ? "Transcribed" : transcribing ? "Transcribing…" : "Transcribe"}
      </button>

      {transcribeError ? (
        <div style={{ marginTop: 8, fontSize: 11, color: "var(--red)", lineHeight: 1.4 }}>
          {transcribeError}
        </div>
      ) : null}

      {transcription ? (
        <div
          style={{
            marginTop: 10,
            padding: "10px 12px",
            borderRadius: 10,
            background: "var(--bg-3)",
            border: "1px solid var(--border-1)",
            fontSize: 13,
            lineHeight: 1.55,
            color: "var(--text-0)",
            whiteSpace: "pre-wrap",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--text-2)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 6,
            }}
          >
            Transcription
          </div>
          {transcription}
        </div>
      ) : null}

      {caption ? (
        <div style={{ marginTop: 10, fontSize: 13, lineHeight: 1.5, color: "var(--text-0)" }}>
          {caption}
        </div>
      ) : null}
    </div>
  );
}
