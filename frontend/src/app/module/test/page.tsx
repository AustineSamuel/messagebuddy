"use client";

import { useCallback, useState } from "react";
import { fetchContactSummaryTest } from "@/module/test";
import type { ContactSummaryResponse } from "@/whatsappjs-services/chats";

export default function ContactSummaryTestPage() {
  const [chatId, setChatId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ContactSummaryResponse | null>(null);

  const runTest = useCallback(async () => {
    const id = chatId.trim();
    if (!id) {
      setError("Enter a chat ID (e.g. 2348012345678@c.us)");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await fetchContactSummaryTest(id);
      setResult(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      console.error("[module/test] contact-summary failed", err);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  return (
    <main
      style={{
        maxWidth: 640,
        margin: "2rem auto",
        padding: "0 1rem",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Contact summary test</h1>
      <p style={{ color: "#666", fontSize: "0.875rem", marginTop: "0.5rem" }}>
        Calls{" "}
        <code>GET /api/v1/whatsapp/chats/:chatId/contact-summary</code> with your auth
        token and logs the result to the browser console.
      </p>

      <label style={{ display: "block", marginTop: "1.5rem", fontSize: "0.875rem" }}>
        Chat ID
        <input
          type="text"
          value={chatId}
          onChange={(e) => setChatId(e.target.value)}
          placeholder="2348012345678@c.us"
          style={{
            display: "block",
            width: "100%",
            marginTop: "0.35rem",
            padding: "0.5rem 0.75rem",
            border: "1px solid #ccc",
            borderRadius: 6,
          }}
        />
      </label>

      <button
        type="button"
        onClick={() => void runTest()}
        disabled={loading}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          borderRadius: 6,
          border: "none",
          background: "#111",
          color: "#fff",
          cursor: loading ? "wait" : "pointer",
        }}
      >
        {loading ? "Fetching…" : "Fetch & log"}
      </button>

      {error ? (
        <pre
          style={{
            marginTop: "1rem",
            padding: "0.75rem",
            background: "#fef2f2",
            color: "#b91c1c",
            borderRadius: 6,
            fontSize: "0.8125rem",
            overflow: "auto",
          }}
        >
          {error}
        </pre>
      ) : null}

      {result ? (
        <pre
          style={{
            marginTop: "1rem",
            padding: "0.75rem",
            background: "#f4f4f5",
            borderRadius: 6,
            fontSize: "0.8125rem",
            overflow: "auto",
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      ) : null}
    </main>
  );
}
