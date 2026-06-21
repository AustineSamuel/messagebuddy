"use client";

import { useState } from "react";
import { Avatar, Badge, PrimaryBtn } from "@/dashboard/components/ui/primitives";
import type { Contact, ContactRule } from "@/dashboard/types";

interface ContactsPageProps {
  contacts: Contact[];
  onSetRule: (contactId: string, rule: ContactRule) => void;
}

const FILTER_TABS: { key: ContactRule | "all"; label: string }[] = [
  { key: "all", label: "All Contacts" },
  { key: "always", label: "Always Reply" },
  { key: "never", label: "Never Reply" },
  { key: "custom", label: "Custom Rules" },
  { key: "default", label: "Default" },
];

const RULE_CONFIG: Record<ContactRule, { label: string; color: string; bg: string; border: string; desc: string }> = {
  always: { label: "Always", color: "var(--wa-green)", bg: "var(--wa-green-glow)", border: "var(--wa-green)", desc: "AI always responds" },
  never: { label: "Never", color: "var(--red)", bg: "var(--red-muted)", border: "var(--red)", desc: "AI never responds" },
  custom: { label: "Custom", color: "var(--purple)", bg: "var(--purple-muted)", border: "var(--purple)", desc: "Custom AI rules apply" },
  default: { label: "Default", color: "var(--text-2)", bg: "var(--bg-3)", border: "var(--border-2)", desc: "Global rules apply" },
};

function RuleSelector({
  contactId,
  current,
  onChange,
}: {
  contactId: string;
  current: ContactRule;
  onChange: (id: string, rule: ContactRule) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {(["always", "never", "custom"] as ContactRule[]).map((rule) => {
        const cfg = RULE_CONFIG[rule];
        const isActive = current === rule;
        return (
          <button
            key={rule}
            onClick={() => onChange(contactId, isActive ? "default" : rule)}
            style={{
              padding: "4px 11px",
              borderRadius: 99,
              border: `1px solid ${isActive ? cfg.border : "var(--border-2)"}`,
              background: isActive ? cfg.bg : "transparent",
              color: isActive ? cfg.color : "var(--text-2)",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              transition: "all 0.15s",
            }}
          >
            {cfg.label}
          </button>
        );
      })}
    </div>
  );
}

export default function ContactsPage({ contacts, onSetRule }: ContactsPageProps) {
  const [activeFilter, setActiveFilter] = useState<ContactRule | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = contacts.filter((c) => {
    const matchesFilter = activeFilter === "all" || c.rule === activeFilter;
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    return matchesFilter && matchesSearch;
  });

  const counts: Record<ContactRule | "all", number> = {
    all: contacts.length,
    always: contacts.filter((c) => c.rule === "always").length,
    never: contacts.filter((c) => c.rule === "never").length,
    custom: contacts.filter((c) => c.rule === "custom").length,
    default: contacts.filter((c) => c.rule === "default").length,
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-base)",
        overflowY: "auto",
        padding: "28px 32px",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-0)" }}>Contact Rules</h1>
          <PrimaryBtn variant="green" size="sm">
            + Import Contacts
          </PrimaryBtn>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-2)" }}>
          Decide which contacts the AI should reply to, ignore, or handle with custom logic.
        </p>
      </div>

      {/* Summary chips */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.key;
          const cfg = tab.key !== "all" ? RULE_CONFIG[tab.key as ContactRule] : null;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              style={{
                padding: "7px 16px",
                borderRadius: 99,
                border: isActive
                  ? `1px solid ${cfg?.border ?? "var(--wa-green)"}`
                  : "1px solid var(--border-1)",
                background: isActive
                  ? cfg?.bg ?? "var(--wa-green-glow)"
                  : "var(--bg-2)",
                color: isActive
                  ? cfg?.color ?? "var(--wa-green)"
                  : "var(--text-1)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {tab.label}
              <span
                style={{
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: 99,
                  padding: "1px 6px",
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                {counts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div
        style={{
          background: "var(--bg-2)",
          border: "1px solid var(--border-1)",
          borderRadius: "var(--radius-sm)",
          padding: "9px 14px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={15} height={15} style={{ color: "var(--text-2)", flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search contacts by name or phone..."
          style={{
            background: "none", border: "none", outline: "none",
            color: "var(--text-0)", fontSize: 13, width: "100%", fontFamily: "var(--font-sans)",
          }}
        />
      </div>

      {/* Legend */}
      <div
        style={{
          background: "var(--bg-2)",
          border: "1px solid var(--border-1)",
          borderRadius: "var(--radius-sm)",
          padding: "12px 16px",
          marginBottom: 16,
          display: "flex",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        {(Object.entries(RULE_CONFIG) as [ContactRule, typeof RULE_CONFIG[ContactRule]][]).map(([key, cfg]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color }} />
            <span style={{ color: cfg.color, fontWeight: 600 }}>{cfg.label}:</span>
            <span style={{ color: "var(--text-2)" }}>{cfg.desc}</span>
          </div>
        ))}
      </div>

      {/* Contact list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {filtered.map((contact) => {
          const cfg = RULE_CONFIG[contact.rule];
          return (
            <div
              key={contact.id}
              style={{
                background: "var(--surface-1)",
                border: "1px solid var(--border-1)",
                borderRadius: "var(--radius-md)",
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                transition: "background 0.1s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--surface-1)")}
            >
              <Avatar initials={contact.initials} color={contact.avatarColor} size={44} online={contact.online} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-0)" }}>{contact.name}</span>
                  {contact.tags?.map((tag) => (
                    <Badge key={tag} variant="blue">{tag}</Badge>
                  ))}
                  {contact.aiHandled && (
                    <Badge variant="green">AI</Badge>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-2)" }}>{contact.phone}</div>
              </div>

              {/* Current rule indicator */}
              <div
                style={{
                  padding: "4px 12px",
                  borderRadius: 99,
                  border: `1px solid ${cfg.border}`,
                  background: cfg.bg,
                  color: cfg.color,
                  fontSize: 11,
                  fontWeight: 700,
                  minWidth: 90,
                  textAlign: "center",
                  letterSpacing: "0.3px",
                }}
              >
                {cfg.label}
              </div>

              {/* Rule selector */}
              <RuleSelector contactId={contact.id} current={contact.rule} onChange={onSetRule} />

              {/* Actions */}
              <button
                style={{
                  background: "var(--bg-3)",
                  border: "1px solid var(--border-1)",
                  borderRadius: 6,
                  padding: "5px 10px",
                  fontSize: 11,
                  color: "var(--text-2)",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                Edit Rules
              </button>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", color: "var(--text-2)", fontSize: 13, padding: "40px 0" }}>
          No contacts match your filter.
        </div>
      )}
    </div>
  );
}
