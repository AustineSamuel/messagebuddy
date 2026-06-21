"use client";

import { useState } from "react";
import { Avatar, Badge } from "@/dashboard/components/ui/primitives";
import type { Contact } from "@/dashboard/types";

const RULE_LABELS: Record<string, { label: string; variant: "green" | "red" | "purple" | "gray" }> = {
  always: { label: "AI", variant: "green" },
  never: { label: "SKIP", variant: "red" },
  custom: { label: "RULE", variant: "purple" },
  default: { label: "DEF", variant: "gray" },
};

interface ChatListProps {
  contacts: Contact[];
  activeContactId: string;
  onSelectContact: (id: string) => void;
  loading?: boolean;
  onRefresh?: () => void;
}

export default function ChatList({
  contacts,
  activeContactId,
  onSelectContact,
  loading,
  onRefresh,
}: ChatListProps) {
  const [search, setSearch] = useState("");

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      style={{
        width: 300,
        background: "var(--bg-1)",
        borderRight: "1px solid var(--border-1)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 16px 12px",
          borderBottom: "1px solid var(--border-1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-0)" }}>Messages</h2>
          <p style={{ fontSize: 11, color: "var(--text-2)", marginTop: 1 }}>
            {contacts.filter((c) => c.unreadCount > 0).length} unread
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Badge variant="green">AI Live</Badge>
          <button
            type="button"
            onClick={onRefresh}
            title="Refresh chats"
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              border: "1px solid var(--border-1)",
              background: "var(--bg-2)",
              color: "var(--text-1)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={14} height={14}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border-1)" }}>
        <div
          style={{
            background: "var(--bg-3)",
            border: "1px solid var(--border-1)",
            borderRadius: 8,
            padding: "7px 12px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={14} height={14} style={{ color: "var(--text-2)", flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            style={{
              background: "none",
              border: "none",
              outline: "none",
              color: "var(--text-0)",
              fontSize: 13,
              width: "100%",
              fontFamily: "var(--font-sans)",
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-2)", lineHeight: 1, padding: 0 }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border-1)", padding: "0 4px" }}>
        {["All", "AI Active", "Unread"].map((tab, i) => (
          <button
            key={tab}
            style={{
              flex: 1,
              padding: "8px 4px",
              background: "none",
              border: "none",
              borderBottom: i === 0 ? "2px solid var(--wa-green)" : "2px solid transparent",
              color: i === 0 ? "var(--wa-green)" : "var(--text-2)",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              transition: "all 0.15s",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Chat list */}
      <div style={{ overflow: "auto", flex: 1 }}>
        {loading ? (
          <p style={{ padding: 20, fontSize: 13, color: "var(--text-2)", textAlign: "center" }}>
            Loading chats…
          </p>
        ) : filtered.length === 0 ? (
          <p style={{ padding: 20, fontSize: 13, color: "var(--text-2)", textAlign: "center" }}>
            No conversations yet.
          </p>
        ) : null}
        {filtered.map((contact) => {
          const isActive = contact.id === activeContactId;
          const ruleInfo = RULE_LABELS[contact.rule];
          return (
            <button
              key={contact.id}
              onClick={() => onSelectContact(contact.id)}
              style={{
                width: "100%",
                padding: "11px 16px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                borderBottom: "1px solid var(--border-1)",
                background: isActive ? "var(--surface-2)" : "transparent",
                border: "none",
                borderLeft: isActive ? "3px solid var(--wa-green)" : "3px solid transparent",
                textAlign: "left",
                fontFamily: "var(--font-sans)",
                transition: "background 0.1s",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = "var(--bg-2)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              <Avatar
                initials={contact.initials}
                color={contact.avatarColor}
                size={42}
                online={contact.online}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-0)" }}>
                    {contact.name}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-2)", flexShrink: 0 }}>
                    {contact.lastMessageTime}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {contact.aiHandled && (
                    <span
                      style={{
                        background: "var(--wa-green-glow)",
                        color: "var(--wa-green)",
                        fontSize: 9,
                        fontWeight: 700,
                        padding: "1px 5px",
                        borderRadius: 4,
                        flexShrink: 0,
                        letterSpacing: "0.3px",
                      }}
                    >
                      AI
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--text-2)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flex: 1,
                    }}
                  >
                    {contact.lastMessage}
                  </span>
                  {contact.unreadCount > 0 ? (
                    <span
                      style={{
                        background: "var(--wa-green)",
                        color: "#fff",
                        borderRadius: 99,
                        fontSize: 10,
                        fontWeight: 700,
                        minWidth: 18,
                        height: 18,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 4px",
                        flexShrink: 0,
                      }}
                    >
                      {contact.unreadCount}
                    </span>
                  ) : (
                    <Badge variant={ruleInfo.variant} className="flex-shrink-0">
                      {ruleInfo.label}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
