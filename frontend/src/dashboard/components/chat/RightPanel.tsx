"use client";

import { useEffect, useState } from "react";
import { Avatar, Badge, SectionLabel, Toggle, FormTextarea, AddBtn, PrimaryBtn } from "@/dashboard/components/ui/primitives";
import { RightPanelSkeleton } from "@/dashboard/components/ui/WhatsAppSkeleton";
import type { ChatRuleSettings } from "@/app/services/chat-rules";
import type { Contact, ContactRule, RightTab, TriggerRule } from "@/dashboard/types";
import { DEMO_DAILY_CREDITS } from "@/dashboard/data/demo";

interface RightPanelProps {
  contact: Contact;
  activeTab: RightTab;
  onTabChange: (tab: RightTab) => void;
  triggerRules: TriggerRule[];
  onAddTriggerRule: (rule: Omit<TriggerRule, "id">) => void;
  onRemoveTriggerRule: (id: number) => void;
  creditsBalance: number;
  chatSettings: ChatRuleSettings | null;
  loadingSettings?: boolean;
  savingSettings?: boolean;
  onSaveSettings: (data: Partial<Omit<ChatRuleSettings, "chatId">>) => Promise<void>;
  onRuleChange: (contactId: string, rule: ContactRule) => void | Promise<void>;
}

const TABS: { key: RightTab; label: string }[] = [
  { key: "info", label: "Contact" },
  { key: "ai", label: "AI Rules" },
  { key: "credits", label: "Credits" },
];

const RULE_OPTIONS: { key: ContactRule; label: string; color: string }[] = [
  { key: "default", label: "Use default", color: "var(--text-2)" },
  { key: "always", label: "Always reply", color: "var(--wa-green)" },
  { key: "never", label: "Never reply", color: "var(--red)" },
  { key: "custom", label: "Custom", color: "var(--purple)" },
];

export default function RightPanel({
  contact,
  activeTab,
  onTabChange,
  triggerRules,
  onAddTriggerRule,
  onRemoveTriggerRule,
  creditsBalance,
  chatSettings,
  loadingSettings,
  savingSettings,
  onSaveSettings,
  onRuleChange,
}: RightPanelProps) {
  const [rule, setRule] = useState<ContactRule>(contact.rule);
  const [notes, setNotes] = useState(contact.notes ?? "");
  const [aiReply, setAiReply] = useState(true);
  const [sendCatalog, setSendCatalog] = useState(false);
  const [notifyMe, setNotifyMe] = useState(true);
  const [customInstructions, setCustomInstructions] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!chatSettings) {
      setRule(contact.rule);
      setNotes(contact.notes ?? "");
      return;
    }
    setRule(chatSettings.rule);
    setNotes(chatSettings.notes ?? "");
    setAiReply(chatSettings.aiAutoReply);
    setSendCatalog(chatSettings.sendCatalog);
    setNotifyMe(chatSettings.notifyOnReply);
    setCustomInstructions(chatSettings.customInstructions ?? "");
  }, [chatSettings, contact.id, contact.notes, contact.rule]);

  const creditsToday = DEMO_DAILY_CREDITS[DEMO_DAILY_CREDITS.length - 1].used;
  const creditsMax = Math.max(...DEMO_DAILY_CREDITS.map((d) => d.used));

  const handleSave = async () => {
    await onSaveSettings({
      rule,
      notes: notes.trim() || null,
      aiAutoReply: aiReply,
      sendCatalog,
      notifyOnReply: notifyMe,
      customInstructions: customInstructions.trim() || null,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loadingSettings && !chatSettings) {
    return <RightPanelSkeleton />;
  }

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
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        {activeTab === "info" && (
          <div>
            <div
              style={{
                background: "var(--bg-2)",
                border: "1px solid var(--border-1)",
                borderRadius: "var(--radius-sm)",
                padding: 14,
                marginBottom: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <Avatar initials={contact.initials} color={contact.avatarColor} size={46} online={contact.online} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-0)" }}>{contact.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-2)" }}>{contact.phone}</div>
                </div>
              </div>
            </div>

            <SectionLabel>Reply rule</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
              {RULE_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => {
                    setRule(opt.key);
                    void onRuleChange(contact.id, opt.key);
                  }}
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: rule === opt.key ? `1px solid ${opt.color}` : "1px solid var(--border-1)",
                    background: rule === opt.key ? "var(--bg-3)" : "var(--bg-2)",
                    color: rule === opt.key ? opt.color : "var(--text-1)",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <SectionLabel>AI behavior</SectionLabel>
            <div
              style={{
                background: "var(--bg-2)",
                border: "1px solid var(--border-1)",
                borderRadius: "var(--radius-sm)",
                padding: "4px 12px",
                marginBottom: 12,
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
              style={{ minHeight: 70, fontSize: 12, marginBottom: 12 }}
            />

            <PrimaryBtn
              variant="green"
              style={{ width: "100%", opacity: savingSettings ? 0.7 : 1 }}
              onClick={() => void handleSave()}
            >
              {savingSettings ? "Saving…" : saved ? "Saved ✓" : "Save contact rules"}
            </PrimaryBtn>
          </div>
        )}

        {activeTab === "ai" && (
          <div>
            <SectionLabel>Writing instructions</SectionLabel>
            <FormTextarea
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="Custom AI instructions for this chat..."
              style={{ minHeight: 110, fontSize: 12, marginBottom: 12 }}
            />

            <SectionLabel>Response triggers</SectionLabel>
            {triggerRules.map((r) => (
              <div
                key={r.id}
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
                  <span style={{ color: "var(--text-0)", fontWeight: 600 }}>"{r.keyword}"</span>
                  {" → "}{r.action}
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveTriggerRule(r.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)" }}
                >
                  ✕
                </button>
              </div>
            ))}
            <AddBtn onClick={() => onAddTriggerRule({ keyword: "order", action: "Send order status" })}>
              Add trigger rule
            </AddBtn>

            <div style={{ marginTop: 14 }}>
              <PrimaryBtn
                variant="green"
                style={{ width: "100%", opacity: savingSettings ? 0.7 : 1 }}
                onClick={() => void handleSave()}
              >
                {savingSettings ? "Saving…" : saved ? "Saved ✓" : "Save AI rules"}
              </PrimaryBtn>
            </div>
          </div>
        )}

        {activeTab === "credits" && (
          <div>
            <div
              style={{
                background: "linear-gradient(135deg, rgba(37,211,102,0.12), rgba(18,140,126,0.08))",
                border: "1px solid rgba(37,211,102,0.25)",
                borderRadius: "var(--radius-sm)",
                padding: 14,
                marginBottom: 8,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-2)", textTransform: "uppercase", marginBottom: 6 }}>
                Balance
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--wa-green)" }}>
                {creditsBalance.toLocaleString()}
              </div>
            </div>

            <SectionLabel>This week</SectionLabel>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 64, marginBottom: 12 }}>
              {DEMO_DAILY_CREDITS.map((d, i) => {
                const pct = Math.round((d.used / creditsMax) * 100);
                const isToday = i === DEMO_DAILY_CREDITS.length - 1;
                return (
                  <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                    <div
                      style={{
                        width: "100%",
                        borderRadius: "3px 3px 0 0",
                        background: isToday ? "var(--wa-green)" : "var(--blue)",
                        opacity: isToday ? 0.9 : 0.5,
                        height: `${pct}%`,
                        minHeight: 3,
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <Badge variant="gray">Used today: {creditsToday} credits</Badge>
          </div>
        )}
      </div>
    </div>
  );
}
