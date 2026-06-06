"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, IconButton } from "@/dashboard/components/ui/primitives";
import MessageBubble from "./MessageBubble";
import EditMessageModal from "./EditMessageModal";
import type { Contact, Conversation, Message } from "@/dashboard/types";

interface ChatAreaProps {
  contact: Contact;
  conversation: Conversation | undefined;
  onSendMessage: (text: string) => void;
  onEditMessage: (messageId: string, newText: string) => void;
  creditsToday: number;
}

export default function ChatArea({
  contact,
  conversation,
  onSendMessage,
  onEditMessage,
  creditsToday,
}: ChatAreaProps) {
  const [inputValue, setInputValue] = useState("");
  const [editingMsg, setEditingMsg] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    onSendMessage(inputValue);
    setInputValue("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const messages = conversation?.messages ?? [];
  const aiActive = contact.rule !== "never";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", minWidth: 0 }}>
      {/* WA pattern */}
      <div className="wa-pattern-bg" />

      {/* Top bar */}
      <div
        style={{
          padding: "13px 20px",
          background: "var(--bg-1)",
          borderBottom: "1px solid var(--border-1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 1,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar initials={contact.initials} color={contact.avatarColor} size={40} online={contact.online} />
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-0)" }}>{contact.name}</h3>
            <div
              style={{
                fontSize: 11,
                color: aiActive ? "var(--wa-green)" : "var(--text-2)",
                display: "flex",
                alignItems: "center",
                gap: 5,
                marginTop: 1,
              }}
            >
              {aiActive && (
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--wa-green)",
                    display: "inline-block",
                    animation: "pulse-dot 2s infinite",
                  }}
                />
              )}
              {aiActive ? "AI responding" : "AI disabled — manual only"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <IconButton title="Search messages">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={15} height={15}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </IconButton>
          <IconButton title="Voice call">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={15} height={15}>
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </IconButton>
          <IconButton title="More options">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={15} height={15}>
              <circle cx="12" cy="5" r="1" fill="currentColor" />
              <circle cx="12" cy="12" r="1" fill="currentColor" />
              <circle cx="12" cy="19" r="1" fill="currentColor" />
            </svg>
          </IconButton>
        </div>
      </div>

      {/* AI status bar */}
      {aiActive && (
        <div
          style={{
            padding: "7px 20px",
            background: "rgba(37,211,102,0.05)",
            borderBottom: "1px solid rgba(37,211,102,0.12)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            color: "var(--text-1)",
            position: "relative",
            zIndex: 1,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--wa-green)",
              flexShrink: 0,
              animation: "pulse-dot 2s infinite",
            }}
          />
          <span>AI Agent active — responding on your behalf</span>
          <span style={{ marginLeft: "auto", color: "var(--text-2)", fontSize: 11 }}>
            {creditsToday} credits used today
          </span>
        </div>
      )}

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Date divider */}
        <div style={{ textAlign: "center", margin: "8px 0" }}>
          <span
            style={{
              background: "var(--bg-2)",
              border: "1px solid var(--border-1)",
              padding: "3px 14px",
              borderRadius: 99,
              fontSize: 11,
              color: "var(--text-2)",
            }}
          >
            Today
          </span>
        </div>

        {messages.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--text-2)", fontSize: 13, marginTop: 40 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onEdit={msg.aiGenerated ? setEditingMsg : undefined}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div
        style={{
          padding: "12px 20px",
          background: "var(--bg-1)",
          borderTop: "1px solid var(--border-1)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          position: "relative",
          zIndex: 1,
          flexShrink: 0,
        }}
      >
        <IconButton title="Attach file">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={15} height={15}>
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </IconButton>
        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          style={{
            flex: 1,
            background: "var(--bg-3)",
            border: "1px solid var(--border-1)",
            borderRadius: 22,
            padding: "10px 16px",
            fontSize: 13,
            color: "var(--text-0)",
            fontFamily: "var(--font-sans)",
            outline: "none",
            height: 42,
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--wa-green)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border-1)")}
        />
        <IconButton title="Emoji">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={15} height={15}>
            <circle cx="12" cy="12" r="10" />
            <path d="M8 13s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </IconButton>
        <button
          onClick={handleSend}
          disabled={!inputValue.trim()}
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            background: inputValue.trim() ? "var(--wa-green)" : "var(--bg-3)",
            border: `1px solid ${inputValue.trim() ? "var(--wa-green)" : "var(--border-1)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: inputValue.trim() ? "pointer" : "default",
            flexShrink: 0,
            transition: "all 0.2s",
          }}
        >
          <svg viewBox="0 0 24 24" fill={inputValue.trim() ? "#fff" : "var(--text-3)"} width={16} height={16} style={{ marginLeft: 2 }}>
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>

      {/* Edit modal */}
      {editingMsg && (
        <EditMessageModal
          message={editingMsg}
          onSave={(newText) => {
            onEditMessage(editingMsg.id, newText);
            setEditingMsg(null);
          }}
          onClose={() => setEditingMsg(null)}
        />
      )}
    </div>
  );
}
