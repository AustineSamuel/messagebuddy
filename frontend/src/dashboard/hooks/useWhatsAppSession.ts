"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "@/app/lib/api";
import {
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

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    if (
      session?.status === "ready" ||
      session?.status === "disconnected" ||
      session?.status === "auth_failure"
    ) {
      return;
    }

    pollRef.current = setInterval(() => {
      void refresh();
    }, 2500);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [session?.status, refresh]);

  const isReady = session?.status === "ready";

  return {
    session,
    loading,
    connecting,
    error,
    isReady,
    connect,
    refresh,
  };
}
