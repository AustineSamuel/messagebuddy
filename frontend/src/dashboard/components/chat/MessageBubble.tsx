"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import EmojiPicker, { Theme, type EmojiClickData } from "emoji-picker-react";
import type { Message } from "@/dashboard/types";
import AudioMessageContent from "@/dashboard/components/chat/AudioMessageContent";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

interface MessageBubbleProps {
  message: Message;
  showSender?: boolean;
  isGroup?: boolean;
  onEdit?: (msg: Message) => void;
  onReply?: (msg: Message) => void;
  onReact?: (msg: Message, emoji: string) => void;
  contactName?: string;
}

export default function MessageBubble({
  message,
  showSender = false,
  isGroup = false,
  onEdit,
  onReply,
  onReact,
  contactName = "Contact",
}: MessageBubbleProps) {
  const isOut = message.direction === "out";
  const [showActions, setShowActions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  const clearLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const startLongPress = useCallback(() => {
    if (!onReact) return;
    clearLongPress();
    longPressTimerRef.current = setTimeout(() => {
      setShowActions(true);
    }, 450);
  }, [clearLongPress, onReact]);

  useEffect(() => {
    if (!showActions && !showEmojiPicker) return;

    const handleOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (bubbleRef.current && !bubbleRef.current.contains(target)) {
        setShowActions(false);
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [showActions, showEmojiPicker]);

  const handleReact = (emoji: string) => {
    onReact?.(message, emoji);
    setShowActions(false);
    setShowEmojiPicker(false);
  };

  const handleEmojiPick = (emojiData: EmojiClickData) => {
    handleReact(emojiData.emoji);
  };

  return (
    <div
      className="animate-fade-up message-bubble-wrap"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isOut ? "flex-end" : "flex-start",
        maxWidth: "72%",
        alignSelf: isOut ? "flex-end" : "flex-start",
        gap: 4,
        position: "relative",
      }}
      ref={bubbleRef}
    >
      {showSender && message.senderLabel ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 1,
            paddingLeft: isOut ? 0 : 2,
            paddingRight: isOut ? 2 : 0,
            alignSelf: isOut ? "flex-end" : "flex-start",
          }}
        >
          {!isOut && isGroup ? (
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: message.senderColor ?? "var(--wa-green)",
                flexShrink: 0,
              }}
            />
          ) : null}
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.02em",
              color: isOut
                ? "var(--text-2)"
                : isGroup
                  ? message.senderColor ?? "var(--wa-green)"
                  : "var(--text-1)",
              lineHeight: 1.2,
            }}
          >
            {message.senderLabel}
          </span>
        </div>
      ) : null}

      {showActions ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 8px",
            borderRadius: 999,
            background: "var(--bg-1)",
            border: "1px solid var(--border-1)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            marginBottom: 4,
            position: "relative",
            zIndex: 3,
          }}
        >
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleReact(emoji)}
              style={{
                background: "none",
                border: "none",
                fontSize: 20,
                cursor: "pointer",
                lineHeight: 1,
                padding: 2,
              }}
            >
              {emoji}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            style={{
              background: "var(--bg-3)",
              border: "1px solid var(--border-2)",
              borderRadius: 999,
              width: 28,
              height: 28,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            +
          </button>
          {onReply ? (
            <button
              type="button"
              onClick={() => {
                onReply(message);
                setShowActions(false);
              }}
              title="Reply"
              style={{
                background: "var(--bg-3)",
                border: "1px solid var(--border-2)",
                borderRadius: 999,
                width: 28,
                height: 28,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ↩
            </button>
          ) : null}
        </div>
      ) : null}

      {showEmojiPicker ? (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            [isOut ? "right" : "left"]: 0,
            zIndex: 5,
            marginBottom: 8,
          }}
        >
          <EmojiPicker
            onEmojiClick={handleEmojiPick}
            theme={Theme.DARK}
            width={320}
            height={360}
            searchPlaceholder="Search emoji"
            previewConfig={{ showPreview: false }}
          />
        </div>
      ) : null}

      <div
        style={{
          padding: "9px 13px",
          borderRadius: isOut ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
          background: isOut ? "var(--msg-out)" : "var(--msg-in)",
          border: `1px solid ${isOut ? "var(--msg-out-border)" : "var(--msg-in-border)"}`,
          fontSize: 13,
          lineHeight: 1.55,
          color: "var(--text-0)",
          cursor: message.aiGenerated && !message.isAudio ? "pointer" : "default",
          position: "relative",
          transition: "filter 0.15s",
          wordBreak: "break-word",
          userSelect: "none",
        }}
        onMouseEnter={(e) => {
          if (message.aiGenerated) e.currentTarget.style.filter = "brightness(1.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.filter = "none";
        }}
        onMouseDown={startLongPress}
        onMouseUp={clearLongPress}
        onMouseLeave={clearLongPress}
        onTouchStart={startLongPress}
        onTouchEnd={clearLongPress}
        onTouchCancel={clearLongPress}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowActions(true);
        }}
        onClick={() => {
          if (message.aiGenerated && !message.isAudio && onEdit) onEdit(message);
        }}
        title={message.aiGenerated && !message.isAudio ? "Click to edit AI message" : undefined}
      >
        {message.quotedMessage ? (
          <div
            style={{
              borderLeft: "3px solid var(--wa-green)",
              paddingLeft: 10,
              marginBottom: 8,
              opacity: 0.9,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--wa-green)", marginBottom: 2 }}>
              {message.quotedMessage.fromMe ? "You" : contactName}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.4 }}>
              {message.quotedMessage.text}
            </div>
          </div>
        ) : null}

        {message.isAudio ? (
          <AudioMessageContent
            messageId={message.id}
            caption={message.text || undefined}
            isOut={isOut}
          />
        ) : (
          message.text.split("\n").map((line, i) => (
            <span key={i}>
              {i > 0 && <br />}
              {line}
            </span>
          ))
        )}
        {message.edited ? (
          <span style={{ fontSize: 10, color: "var(--text-2)", marginLeft: 6, fontStyle: "italic" }}>
            edited
          </span>
        ) : null}
      </div>

      {message.reactions && message.reactions.length > 0 ? (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 4,
            marginTop: -2,
            marginBottom: 2,
            alignSelf: isOut ? "flex-end" : "flex-start",
          }}
        >
          {message.reactions.map((reaction) => (
            <span
              key={reaction.emoji}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 8px",
                borderRadius: 999,
                background: "var(--bg-2)",
                border: reaction.fromMe ? "1px solid var(--wa-green)" : "1px solid var(--border-1)",
                fontSize: 12,
              }}
            >
              <span>{reaction.emoji}</span>
              {reaction.count > 1 ? (
                <span style={{ fontSize: 10, color: "var(--text-2)" }}>{reaction.count}</span>
              ) : null}
            </span>
          ))}
        </div>
      ) : null}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          fontSize: 11,
          color: "var(--text-2)",
        }}
      >
        {message.aiGenerated ? (
          <span
            style={{
              background: "var(--wa-green-glow)",
              color: "var(--wa-green)",
              fontSize: 9,
              fontWeight: 700,
              padding: "1px 5px",
              borderRadius: 4,
              letterSpacing: "0.3px",
            }}
          >
            AI
          </span>
        ) : null}
        <span>{message.time}</span>
        {isOut ? (
          <svg viewBox="0 0 18 12" fill="none" width={16} height={10}>
            <path d="M1 6l4 4L17 1" stroke="#53bdeb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 6l4 4" stroke="#53bdeb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
        {onReply ? (
          <button
            type="button"
            onClick={() => onReply(message)}
            className="message-action-btn"
            style={{
              background: "var(--bg-3)",
              border: "1px solid var(--border-2)",
              borderRadius: 5,
              padding: "2px 8px",
              fontSize: 10,
              color: "var(--text-1)",
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              fontWeight: 600,
              opacity: 0,
              transition: "opacity 0.15s",
            }}
          >
            Reply
          </button>
        ) : null}
        {message.aiGenerated && onEdit ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(message);
            }}
            style={{
              background: "var(--bg-3)",
              border: "1px solid var(--border-2)",
              borderRadius: 5,
              padding: "2px 8px",
              fontSize: 10,
              color: "var(--wa-green)",
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              fontWeight: 600,
              opacity: 0,
              transition: "opacity 0.15s",
            }}
            className="edit-btn"
          >
            Edit
          </button>
        ) : null}
      </div>

      <style>{`
        .message-bubble-wrap:hover .edit-btn,
        .message-bubble-wrap:hover .message-action-btn { opacity: 1 !important; }
      `}</style>
    </div>
  );
}
