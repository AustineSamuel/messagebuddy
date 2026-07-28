"use client";

import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "@/app/lib/api";
import {
  getSession,
  initializeSession,
  logoutSession,
  type WhatsAppSession,
} from "@/whatsappjs-services/session";
import {
  useWhatsAppRealtime,
  type RealtimeEvent,
} from "@/dashboard/hooks/useWhatsAppRealtime";

export function useWhatsAppSession() {
  const [session, setSession] = useState<WhatsAppSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const next = await getSession();
      setSession(next);
      setError(null);
      return next;
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    }
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      const next = await initializeSession();
      setSession(next);
    } catch (err) {
      setError(getErrorMessage(err, "Could not start WhatsApp session."));
    } finally {
      setConnecting(false);
    }
  }, [refresh]);

  const retry = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      const next = await initializeSession();
      setSession(next);
    } catch (err) {
      setError(getErrorMessage(err, "Could not restart WhatsApp session."));
    } finally {
      setConnecting(false);
    }
  }, [refresh]);

  const logoutWhatsApp = useCallback(async () => {
    setError(null);
    try {
      await logoutSession();
      setSession({
        status: "disconnected",
        qr: null,
        pairingCode: null,
        lastError: null,
        loadingPercent: null,
      });
    } catch (err) {
      setError(getErrorMessage(err, "Could not disconnect WhatsApp."));
      throw err;
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const handleRealtimeEvent = useCallback((event: RealtimeEvent) => {
    if (event.type === "session:update") {
      setSession(event.session);
      setError(null);
      setConnecting(false);
    }
  }, []);

  useWhatsAppRealtime({
    enabled: true,
    onEvent: handleRealtimeEvent,
    onConnectionChange: setRealtimeConnected,
  });

  useEffect(() => {
    if (realtimeConnected) return;
    if (session?.status === "ready" || session?.status === "auth_failure") return;
    if (session?.status === "disconnected" && !connecting) return;

    const timer = setInterval(() => void refresh(), 15_000);
    return () => clearInterval(timer);
  }, [realtimeConnected, session?.status, connecting, refresh]);

  const isReady = session?.status === "ready";

  const dismissError = useCallback(() => setError(null), []);

  return {
    session,
    loading,
    connecting,
    error,
    isReady,
    connect,
    retry,
    refresh,
    logoutWhatsApp,
    dismissError,
  };
}
