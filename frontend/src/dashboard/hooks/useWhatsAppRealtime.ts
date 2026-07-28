"use client";

import { getAuthToken } from "@/app/lib/auth-token";
import { useEffect, useRef } from "react";
import type { ApiChat, ApiMessage } from "@/dashboard/lib/whatsapp-mappers";
import type { MessageReaction } from "@/dashboard/types";
import type { WhatsAppSession } from "@/whatsappjs-services/session";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3333";

export type RealtimeMessageEvent = {
  type: "message:new";
  chatId: string;
  message: ApiMessage;
  chat: ApiChat;
};

export type RealtimeReactionEvent = {
  type: "message:reaction";
  chatId: string;
  messageId: string;
  reactions: MessageReaction[];
};

export type RealtimeSessionEvent = {
  type: "session:update";
  session: WhatsAppSession;
};

export type RealtimeEvent =
  | RealtimeMessageEvent
  | RealtimeReactionEvent
  | RealtimeSessionEvent;

function buildWebSocketUrl(token: string) {
  const wsBase = API_BASE.replace(/^http/i, (match) =>
    match.toLowerCase() === "https" ? "wss" : "ws"
  );
  return `${wsBase}/ws?token=${encodeURIComponent(token)}`;
}

export function useWhatsAppRealtime({
  enabled,
  onEvent,
  onConnectionChange,
}: {
  enabled: boolean;
  onEvent: (event: RealtimeEvent) => void;
  onConnectionChange?: (connected: boolean) => void;
}) {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;
  const onConnectionChangeRef = useRef(onConnectionChange);
  onConnectionChangeRef.current = onConnectionChange;

  useEffect(() => {
    if (!enabled) return;

    const token = getAuthToken();
    if (!token) return;

    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let closed = false;

    const authToken = token;

    function connect() {
      ws = new WebSocket(buildWebSocketUrl(authToken));

      ws.onopen = () => onConnectionChangeRef.current?.(true);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(String(event.data)) as { type?: string };
          if (
            data.type === "message:new" ||
            data.type === "message:reaction" ||
            data.type === "session:update"
          ) {
            onEventRef.current(data as RealtimeEvent);
          }
        } catch {
          // ignore malformed payloads
        }
      };

      ws.onclose = () => {
        onConnectionChangeRef.current?.(false);
        if (!closed) {
          reconnectTimer = setTimeout(connect, 3000);
        }
      };
    }

    connect();

    return () => {
      closed = true;
      onConnectionChangeRef.current?.(false);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, [enabled]);
}
