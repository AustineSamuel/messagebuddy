"use client";

import type { Message } from "@/dashboard/types";
import AudioMessageContent from "@/dashboard/components/chat/AudioMessageContent";

interface MessageBubbleProps {
  message: Message;
  showSender?: boolean;
  isGroup?: boolean;
  onEdit?: (msg: Message) => void;
}

export default function MessageBubble({
  message,
  showSender = false,
  isGroup = false,
  onEdit,
}: MessageBubbleProps) {
  const isOut = message.direction === "out";

  return (
    <div
      className="animate-fade-up"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isOut ? "flex-end" : "flex-start",
        maxWidth: "72%",
        alignSelf: isOut ? "flex-end" : "flex-start",
        gap: 4,
      }}
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
        }}
        onMouseEnter={(e) => {
          if (message.aiGenerated) e.currentTarget.style.filter = "brightness(1.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.filter = "none";
        }}
        onClick={() => {
          if (message.aiGenerated && !message.isAudio && onEdit) onEdit(message);
        }}
        title={message.aiGenerated && !message.isAudio ? "Click to edit AI message" : undefined}
      >
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
        {message.edited && (
          <span style={{ fontSize: 10, color: "var(--text-2)", marginLeft: 6, fontStyle: "italic" }}>
            edited
          </span>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          fontSize: 11,
          color: "var(--text-2)",
        }}
      >
        {message.aiGenerated && (
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
        )}
        <span>{message.time}</span>
        {isOut && (
          <svg viewBox="0 0 18 12" fill="none" width={16} height={10}>
            <path d="M1 6l4 4L17 1" stroke="#53bdeb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 6l4 4" stroke="#53bdeb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {message.aiGenerated && onEdit && (
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
        )}
      </div>

      <style>{`.animate-fade-up:hover .edit-btn { opacity: 1 !important; }`}</style>
    </div>
  );
}
