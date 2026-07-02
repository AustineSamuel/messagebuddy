"use client";

import { useState, useRef, useEffect } from "react";
import EmojiPicker, { Theme, type EmojiClickData } from "emoji-picker-react";
import { Avatar, IconButton } from "@/dashboard/components/ui/primitives";
import MessageBubble from "./MessageBubble";
import EditMessageModal from "./EditMessageModal";
import { shouldShowSenderHeader } from "@/dashboard/lib/whatsapp-mappers";
import { ChatAreaSkeleton } from "@/dashboard/components/ui/WhatsAppSkeleton";
import { getErrorMessage } from "@/app/lib/api";
import { suggestAiReply } from "@/whatsappjs-services/chats";
import type { Contact, Conversation, Message } from "@/dashboard/types";

interface ChatAreaProps {
  contact: Contact | undefined;
  conversation: Conversation | undefined;
  onSendMessage: (text: string) => void;
  onSendReply: (messageId: string, text: string) => void;
  onReactToMessage: (messageId: string, emoji: string) => void;
  onEditMessage: (messageId: string, newText: string) => void;
  creditsToday: number;
  loadingMessages?: boolean;
}

export default function ChatArea({
  contact,
  conversation,
  onSendMessage,
  onSendReply,
  onReactToMessage,
  onEditMessage,
  creditsToday,
  loadingMessages,
}: ChatAreaProps) {
  const [inputValue, setInputValue] = useState("");
  const [editingMsg, setEditingMsg] = useState<Message | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  useEffect(() => {
    setReplyingTo(null);
    setShowEmojiPicker(false);
  }, [contact?.id]);

  useEffect(() => {
    if (!showEmojiPicker) return;
    const handleOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [showEmojiPicker]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    if (replyingTo) {
      onSendReply(replyingTo.id, inputValue.trim());
      setReplyingTo(null);
    } else {
      onSendMessage(inputValue.trim());
    }
    setInputValue("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleGenerateAi = async () => {
    if (!contact?.id || generatingAi) return;
    setGeneratingAi(true);
    setGenerateError(null);
    try {
      const result = await suggestAiReply(contact.id, { limit: 50 });
      setInputValue(result.suggestion);
      inputRef.current?.focus();
    } catch (err) {
      setGenerateError(getErrorMessage(err, "Could not generate AI reply."));
    } finally {
      setGeneratingAi(false);
    }
  };

  useEffect(() => {
    setGenerateError(null);
  }, [contact?.id]);

  const messages = conversation?.messages ?? [];
  const aiActive = contact ? contact.rule !== "never" : false;
  const isGroup = contact?.isGroup ?? false;

  if (!contact) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-2)" }}>
        Select a chat to start messaging
      </div>
    );
  }

  if (loadingMessages && messages.length === 0) {
    return <ChatAreaSkeleton />;
  }

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

        {loadingMessages && messages.length > 0 ? (
          <div style={{ textAlign: "center", color: "var(--text-2)", fontSize: 12, padding: 8 }}>
            Loading more…
          </div>
        ) : null}

        {!loadingMessages && messages.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--text-2)", fontSize: 13, marginTop: 40 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg, index) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isGroup={isGroup}
              showSender={shouldShowSenderHeader(msg, messages[index - 1], isGroup)}
              onEdit={msg.aiGenerated ? setEditingMsg : undefined}
              onReply={setReplyingTo}
              onReact={(message, emoji) => onReactToMessage(message.id, emoji)}
              contactName={contact.name}
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
          position: "relative",
          zIndex: 1,
          flexShrink: 0,
        }}
      >
        {generateError ? (
          <div
            style={{
              marginBottom: 8,
              padding: "8px 12px",
              borderRadius: 8,
              background: "var(--red-muted)",
              border: "1px solid var(--red)",
              color: "var(--red)",
              fontSize: 12,
            }}
          >
            {generateError}
          </div>
        ) : null}
        {replyingTo ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 10,
              padding: "10px 12px",
              borderRadius: 10,
              background: "var(--bg-2)",
              border: "1px solid var(--border-1)",
            }}
          >
            <div style={{ borderLeft: "3px solid var(--wa-green)", paddingLeft: 10, flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--wa-green)", marginBottom: 2 }}>
                Replying to {replyingTo.direction === "out" ? "yourself" : contact.name}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-2)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {replyingTo.text || (replyingTo.isAudio ? "Voice message" : "Message")}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-2)",
                cursor: "pointer",
                fontSize: 18,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        ) : null}
        <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
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
          placeholder={replyingTo ? "Type your reply..." : "Type a message..."}
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
        <div ref={emojiPickerRef} style={{ position: "relative" }}>
          {showEmojiPicker ? (
            <div
              style={{
                position: "absolute",
                bottom: "100%",
                right: 0,
                marginBottom: 8,
                zIndex: 20,
              }}
            >
              <EmojiPicker
                onEmojiClick={(emojiData: EmojiClickData) => {
                  setInputValue((prev) => `${prev}${emojiData.emoji}`);
                  inputRef.current?.focus();
                }}
                theme={Theme.DARK}
                width={320}
                height={380}
                searchPlaceholder="Search emoji"
                previewConfig={{ showPreview: false }}
              />
            </div>
          ) : null}
          <IconButton title="Emoji" onClick={() => setShowEmojiPicker((prev) => !prev)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={15} height={15}>
              <circle cx="12" cy="12" r="10" />
              <path d="M8 13s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </IconButton>
        </div>
        <button
          type="button"
          onClick={() => void handleGenerateAi()}
          disabled={generatingAi}
          title="Generate AI response from recent messages"
          style={{
            padding: "0 14px",
            height: 42,
            borderRadius: 22,
            border: "1px solid var(--wa-green)",
            background: generatingAi ? "var(--bg-3)" : "var(--wa-green-glow)",
            color: "var(--wa-green)",
            fontSize: 12,
            fontWeight: 700,
            cursor: generatingAi ? "wait" : "pointer",
            fontFamily: "var(--font-sans)",
            whiteSpace: "nowrap",
            flexShrink: 0,
            opacity: generatingAi ? 0.7 : 1,
          }}
        >
          {generatingAi ? "Generating…" : "✨ AI"}
        </button>
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
