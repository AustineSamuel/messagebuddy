"use client";

import { createPortal } from "react-dom";
import type { Contact } from "@/dashboard/types";
import type { ContactSummaryResponse } from "@/whatsappjs-services/contact-summary-types";

type Props = {
  open: boolean;
  onClose: () => void;
  summaries: ContactSummaryResponse[];
  contacts: Contact[];
  loading?: boolean;
};

function contactName(contacts: Contact[], chatId: string) {
  return contacts.find((c) => c.id === chatId)?.name ?? chatId.split("@")[0] ?? chatId;
}

export default function ContactSummariesModal({
  open,
  onClose,
  summaries,
  contacts,
  loading,
}: Props) {
  if (!open || typeof document === "undefined") return null;

  const withText = summaries.filter((s) => s.summaryText?.trim());

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-summaries-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(0,0,0,0.55)",
        fontFamily: "var(--font-sans)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          maxHeight: "min(80vh, 640px)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          borderRadius: 14,
          background: "var(--surface-1)",
          border: "1px solid var(--border-1)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <h2
              id="contact-summaries-title"
              style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-0)" }}
            >
              All contact summaries
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-2)" }}>
              AI-generated notes about who each person is and what they want.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              border: "none",
              background: "var(--bg-2)",
              color: "var(--text-1)",
              width: 32,
              height: 32,
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          {loading ? (
            <p style={{ textAlign: "center", color: "var(--text-2)", fontSize: 13 }}>
              Loading summaries…
            </p>
          ) : withText.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--text-2)", fontSize: 13 }}>
              No contact summaries yet. Open a chat and wait a few seconds for AI to analyze
              the conversation.
            </p>
          ) : (
            withText.map((item) => (
              <article
                key={item.chatId}
                style={{
                  padding: 14,
                  marginBottom: 10,
                  borderRadius: 10,
                  background: "var(--bg-2)",
                  border: "1px solid var(--border-1)",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--text-0)",
                    marginBottom: 6,
                  }}
                >
                  {contactName(contacts, item.chatId)}
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    lineHeight: 1.55,
                    color: "var(--text-1)",
                  }}
                >
                  {item.summaryText}
                </p>
                {item.updatedAt ? (
                  <p style={{ margin: "8px 0 0", fontSize: 10, color: "var(--text-3)" }}>
                    Updated {new Date(item.updatedAt).toLocaleString()}
                  </p>
                ) : null}
              </article>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
