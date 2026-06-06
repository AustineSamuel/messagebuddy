"use client";

import { useState, useEffect } from "react";
import { PrimaryBtn } from "@/dashboard/components/ui/primitives";
import type { Message } from "@/dashboard/types";

interface EditMessageModalProps {
  message: Message;
  onSave: (newText: string) => void;
  onClose: () => void;
}

export default function EditMessageModal({ message, onSave, onClose }: EditMessageModalProps) {
  const [text, setText] = useState(message.text);

  useEffect(() => {
    setText(message.text);
  }, [message]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="animate-fade-up"
        style={{
          background: "var(--bg-2)",
          border: "1px solid var(--border-2)",
          borderRadius: "var(--radius-md)",
          padding: 24,
          width: 400,
          maxWidth: "90vw",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "var(--wa-green-glow)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--wa-green)" strokeWidth="2" width={18} height={18}>
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-0)", marginBottom: 2 }}>
              Edit AI Message
            </h3>
            <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>
              Modify what the AI sent. This helps train future responses for this contact.
            </p>
          </div>
        </div>

        {/* Original preview */}
        <div
          style={{
            background: "var(--bg-3)",
            border: "1px solid var(--border-1)",
            borderRadius: "var(--radius-xs)",
            padding: "8px 12px",
            marginBottom: 12,
            fontSize: 11,
            color: "var(--text-2)",
          }}
        >
          <div style={{ marginBottom: 4, fontWeight: 600, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.5px", fontSize: 10 }}>
            Original
          </div>
          <div style={{ color: "var(--text-1)", lineHeight: 1.5 }}>{message.text}</div>
        </div>

        {/* Editable textarea */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
          style={{
            width: "100%",
            background: "var(--bg-3)",
            border: "1px solid var(--wa-green)",
            borderRadius: "var(--radius-xs)",
            padding: "10px 12px",
            fontSize: 13,
            color: "var(--text-0)",
            fontFamily: "var(--font-sans)",
            resize: "vertical",
            minHeight: 100,
            lineHeight: 1.6,
            outline: "none",
            marginBottom: 16,
          }}
        />

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <PrimaryBtn variant="ghost" onClick={onClose}>
            Cancel
          </PrimaryBtn>
          <PrimaryBtn
            variant="green"
            onClick={() => onSave(text)}
            disabled={!text.trim() || text === message.text}
          >
            Save & Update
          </PrimaryBtn>
        </div>
      </div>
    </div>
  );
}
