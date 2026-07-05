"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "@/app/lib/api";
import {
  destroySession,
  getSession,
  initializeSession,
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

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    if (
      session?.status === "ready" ||
      session?.status === "disconnected" ||
      session?.status === "auth_failure"
    ) {
      return;
    }

    const intervalMs =
      session?.status === "initializing" || session?.status === "authenticated"
        ? 1000
        : 2500;

    pollRef.current = setInterval(() => {
      void refresh();
    }, intervalMs);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [session?.status, refresh]);

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
    dismissError,
  };
}
