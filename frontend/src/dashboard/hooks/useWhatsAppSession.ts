"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "@/app/lib/api";
import {
  destroySession,
  getSession,
  initializeSession,
  logoutSession,
  type WhatsAppSession,
} from "@/whatsappjs-services/session";

export function useWhatsAppSession() {
  const [session, setSession] = useState<WhatsAppSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      await initializeSession();
      await refresh();
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
      await destroySession().catch(() => undefined);
      await initializeSession();
      await refresh();
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

  useEffect(() => {
    if (session?.status === "ready" || session?.status === "auth_failure") {
      return;
    }

    if (session?.status === "disconnected" && !connecting) {
      return;
    }

    const intervalMs =
      connecting ||
      session?.status === "initializing" ||
      session?.status === "authenticated" ||
      session?.status === "qr"
        ? 1000
        : 2500;

    pollRef.current = setInterval(() => {
      void refresh();
    }, intervalMs);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [session?.status, connecting, refresh]);

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
