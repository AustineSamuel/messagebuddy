"use client";

import { useState } from "react";
import { Avatar, Badge, SectionLabel, Toggle, FormTextarea, AddBtn, PrimaryBtn } from "@/dashboard/components/ui/primitives";
import type { Contact, RightTab, TriggerRule } from "@/dashboard/types";
import { DEMO_DAILY_CREDITS } from "@/dashboard/data/demo";

interface RightPanelProps {
  contact: Contact;
  activeTab: RightTab;
  onTabChange: (tab: RightTab) => void;
  triggerRules: TriggerRule[];
  onAddTriggerRule: (rule: Omit<TriggerRule, "id">) => void;
  onRemoveTriggerRule: (id: number) => void;
  creditsBalance: number;
}

const TABS: { key: RightTab; label: string }[] = [
  { key: "info", label: "Contact" },
  { key: "ai", label: "AI Rules" },
  { key: "credits", label: "Credits" },
];

const RULE_COLORS: Record<string, string> = {
  always: "var(--wa-green)",
  never: "var(--red)",
  custom: "var(--purple)",
  default: "var(--text-2)",
};

export default function RightPanel({
  contact,
  activeTab,
  onTabChange,
  triggerRules,
  onAddTriggerRule,
  onRemoveTriggerRule,
  creditsBalance,
}: RightPanelProps) {
  const [aiReply, setAiReply] = useState(contact.rule !== "never");
  const [sendCatalog, setSendCatalog] = useState(false);
  const [notifyMe, setNotifyMe] = useState(true);
  const [notes, setNotes] = useState(contact.notes ?? "");
  const [aiWritingRules, setAiWritingRules] = useState(
    "Always greet by first name. Keep replies under 3 sentences unless explaining a product. Be warm and professional."
  );

  const creditsToday = DEMO_DAILY_CREDITS[DEMO_DAILY_CREDITS.length - 1].used;
  const creditsMax = Math.max(...DEMO_DAILY_CREDITS.map((d) => d.used));

  return (
    <div
      style={{
        width: 300,
        background: "var(--bg-1)",
        borderLeft: "1px solid var(--border-1)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border-1)", flexShrink: 0 }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            style={{
              flex: 1,
              padding: "13px 0",
              background: "none",
              border: "none",
              borderBottom: activeTab === tab.key ? "2px solid var(--wa-green)" : "2px solid transparent",
              color: activeTab === tab.key ? "var(--wa-green)" : "var(--text-2)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              transition: "all 0.15s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>

        {/* ── INFO TAB ── */}
        {activeTab === "info" && (
          <div>
            {/* Contact card */}
            <div
              style={{
                background: "var(--bg-2)",
                border: "1px solid var(--border-1)",
                borderRadius: "var(--radius-sm)",
                padding: "14px",
                marginBottom: 4,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <Avatar initials={contact.initials} color={contact.avatarColor} size={46} online={contact.online} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-0)", marginBottom: 2 }}>
                    {contact.name}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-2)" }}>{contact.phone}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                <Badge variant={contact.rule === "always" ? "green" : contact.rule === "never" ? "red" : "purple"}>
                  {contact.rule === "always" ? "Always Reply" : contact.rule === "never" ? "Never Reply" : contact.rule === "custom" ? "Custom Rules" : "Default"}
                </Badge>
                {contact.tags?.map((tag) => (
                  <Badge key={tag} variant="blue">{tag}</Badge>
                ))}
              </div>
            </div>

            <SectionLabel>AI Behavior</SectionLabel>
            <div
              style={{
                background: "var(--bg-2)",
                border: "1px solid var(--border-1)",
                borderRadius: "var(--radius-sm)",
                padding: "4px 12px",
                marginBottom: 8,
              }}
            >
              {[
                { label: "AI auto-reply", val: aiReply, set: setAiReply },
                { label: "Send product catalog", val: sendCatalog, set: setSendCatalog },
                { label: "Notify me on reply", val: notifyMe, set: setNotifyMe },
              ].map((item) => (
                <div key={item.label} style={{ borderBottom: "1px solid var(--border-1)", padding: "10px 0" }}>
                  <Toggle label={item.label} checked={item.val} onChange={item.set} />
                </div>
              ))}
            </div>

            <SectionLabel>Notes</SectionLabel>
            <FormTextarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this contact..."
              style={{ minHeight: 70, fontSize: 12 }}
            />

            <SectionLabel>Contact Rules</SectionLabel>
            {[
              { color: "var(--wa-green)", text: "Always greet by first name" },
              { color: "var(--amber)", text: "Offer 10% discount if asked" },
              { color: "var(--blue)", text: "Share website link on price inquiry" },
            ].map((rule, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 10px",
                  background: "var(--bg-2)",
                  border: "1px solid var(--border-1)",
                  borderRadius: "var(--radius-xs)",
                  marginBottom: 4,
                  fontSize: 12,
                  color: "var(--text-1)",
                }}
              >
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: rule.color, flexShrink: 0 }} />
                {rule.text}
              </div>
            ))}
          </div>
        )}

        {/* ── AI RULES TAB ── */}
        {activeTab === "ai" && (
          <div>
            <SectionLabel>Writing Instructions</SectionLabel>
            <FormTextarea
              value={aiWritingRules}
              onChange={(e) => setAiWritingRules(e.target.value)}
              style={{ minHeight: 110, fontSize: 12 }}
            />

            <SectionLabel>Tone Preset</SectionLabel>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
              {["Professional", "Casual", "Formal", "Energetic"].map((tone) => (
                <button
                  key={tone}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 99,
                    border: tone === "Professional" ? "1px solid var(--wa-green)" : "1px solid var(--border-2)",
                    background: tone === "Professional" ? "var(--wa-green-glow)" : "transparent",
                    color: tone === "Professional" ? "var(--wa-green)" : "var(--text-2)",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                    transition: "all 0.15s",
                  }}
                >
                  {tone}
                </button>
              ))}
            </div>

            <SectionLabel>Response Triggers</SectionLabel>
            {triggerRules.map((rule) => (
              <div
                key={rule.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 10px",
                  background: "var(--bg-2)",
                  border: "1px solid var(--border-1)",
                  borderRadius: "var(--radius-xs)",
                  marginBottom: 4,
                  fontSize: 12,
                }}
              >
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--purple)", flexShrink: 0 }} />
                <div style={{ flex: 1, color: "var(--text-1)" }}>
                  <span style={{ color: "var(--text-0)", fontWeight: 600 }}>"{rule.keyword}"</span>
                  {" → "}{rule.action}
                </div>
                <button
                  onClick={() => onRemoveTriggerRule(rule.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", fontSize: 14, lineHeight: 1, padding: "0 2px" }}
                >
                  ✕
                </button>
              </div>
            ))}
            <AddBtn onClick={() => onAddTriggerRule({ keyword: "order", action: "Send order status" })}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={13} height={13}>
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add trigger rule
            </AddBtn>

            <div style={{ marginTop: 14 }}>
              <PrimaryBtn variant="green" style={{ width: "100%" }}>
                Save AI Rules
              </PrimaryBtn>
            </div>
          </div>
        )}

        {/* ── CREDITS TAB ── */}
        {activeTab === "credits" && (
          <div>
            {/* Balance card */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(37,211,102,0.12), rgba(18,140,126,0.08))",
                border: "1px solid rgba(37,211,102,0.25)",
                borderRadius: "var(--radius-sm)",
                padding: 14,
                marginBottom: 8,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6 }}>
                Balance
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--wa-green)", lineHeight: 1 }}>
                {creditsBalance.toLocaleString()}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 4 }}>credits remaining</div>
              <div style={{ marginTop: 10, background: "rgba(37,211,102,0.15)", borderRadius: 99, height: 4, overflow: "hidden" }}>
                <div style={{ width: `${(creditsBalance / 5000) * 100}%`, height: "100%", background: "var(--wa-green)", borderRadius: 99 }} />
              </div>
              <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 4 }}>{creditsBalance} / 5,000</div>
            </div>

            <div
              style={{
                background: "var(--bg-2)",
                border: "1px solid var(--border-1)",
                borderRadius: "var(--radius-sm)",
                padding: 14,
                marginBottom: 8,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 4 }}>
                Used Today
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-0)" }}>{creditsToday}</div>
              <div style={{ fontSize: 12, color: "var(--text-2)" }}>across 47 messages</div>
            </div>

            <SectionLabel>This Week</SectionLabel>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 4,
                height: 64,
                paddingBottom: 20,
                position: "relative",
                marginBottom: 12,
              }}
            >
              {DEMO_DAILY_CREDITS.map((d, i) => {
                const pct = Math.round((d.used / creditsMax) * 100);
                const isToday = i === DEMO_DAILY_CREDITS.length - 1;
                return (
                  <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 0, height: "100%", position: "relative", justifyContent: "flex-end" }}>
                    <div
                      title={`${d.day}: ${d.used} credits`}
                      style={{
                        width: "100%",
                        borderRadius: "3px 3px 0 0",
                        background: isToday ? "var(--wa-green)" : "var(--blue)",
                        opacity: isToday ? 0.9 : 0.5,
                        height: `${pct}%`,
                        minHeight: 3,
                        cursor: "pointer",
                        transition: "opacity 0.15s",
                      }}
                    />
                    <div style={{ fontSize: 9, color: "var(--text-2)", position: "absolute", bottom: -18 }}>{d.day}</div>
                  </div>
                );
              })}
            </div>

            <SectionLabel>Recent Activity</SectionLabel>
            {[
              { name: "Reply to Amaka K.", credits: 3, type: "reply" },
              { name: "Reply to Chidi U.", credits: 4, type: "reply" },
              { name: "Product catalog sent", credits: 1, type: "catalog" },
              { name: "Reply to Fatima A.", credits: 5, type: "reply" },
              { name: "Trigger: price query", credits: 2, type: "trigger" },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "7px 0",
                  borderBottom: "1px solid var(--border-1)",
                  fontSize: 12,
                }}
              >
                <div style={{
                  width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                  background: item.type === "reply" ? "var(--wa-green)" : item.type === "catalog" ? "var(--amber)" : "var(--purple)",
                }} />
                <div style={{ flex: 1, color: "var(--text-1)" }}>{item.name}</div>
                <div style={{ color: "var(--text-2)", fontWeight: 600 }}>{item.credits} cr</div>
              </div>
            ))}

            <div style={{ marginTop: 14 }}>
              <PrimaryBtn variant="green" style={{ width: "100%" }}>
                Buy More Credits
              </PrimaryBtn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
