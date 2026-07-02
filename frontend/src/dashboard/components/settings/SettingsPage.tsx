"use client";

import { useState, useEffect, useRef } from "react";
import {
  FormInput,
  FormTextarea,
  PrimaryBtn,
  SectionLabel,
  Toggle,
} from "@/dashboard/components/ui/primitives";
import type { ChatRuleSettings } from "@/app/services/chat-rules";
import type { BusinessSettings, ContactRule, TriggerRule } from "@/dashboard/types";

interface SettingsPageProps {
  settings: BusinessSettings;
  triggerRules: TriggerRule[];
  defaultChatSettings: ChatRuleSettings | null;
  savingDefaultSettings?: boolean;
  onSaveDefaultChatSettings: (data: Partial<Omit<ChatRuleSettings, "chatId">>) => Promise<void>;
  onUpdateSettings: (patch: Partial<BusinessSettings>) => Promise<void>;
  savingBusinessSettings?: boolean;
  onOpenProducts?: () => void;
  onOpenWebsite?: () => void;
}

const TONES = ["professional", "casual", "formal", "energetic"] as const;

function SettingsSection({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border-1)",
        borderRadius: "var(--radius-md)",
        padding: "20px 24px",
        marginBottom: 16,
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-0)", marginBottom: 3 }}>{title}</h3>
        {subtitle && <p style={{ fontSize: 12, color: "var(--text-2)" }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage({
  settings,
  triggerRules,
  defaultChatSettings,
  savingDefaultSettings,
  onSaveDefaultChatSettings,
  onUpdateSettings,
  onOpenProducts,
  onOpenWebsite,
  savingBusinessSettings,
}: SettingsPageProps) {
  const [local, setLocal] = useState(settings);
  const settingsStampRef = useRef("");
  const defaultRulesStampRef = useRef("");
  const [defaultRule, setDefaultRule] = useState<ContactRule>("default");
  const [defaultNotes, setDefaultNotes] = useState("");
  const [defaultAiReply, setDefaultAiReply] = useState(true);
  const [defaultSendCatalog, setDefaultSendCatalog] = useState(false);
  const [defaultNotify, setDefaultNotify] = useState(true);
  const [defaultInstructions, setDefaultInstructions] = useState("");
  const [aiEnabled, setAiEnabled] = useState(true);
  const [outsideHours, setOutsideHours] = useState(true);
  const [notifyFail, setNotifyFail] = useState(true);
  const [sendReceipts, setSendReceipts] = useState(false);
  const [saved, setSaved] = useState(false);
  const [defaultSaved, setDefaultSaved] = useState(false);

  useEffect(() => {
    const stamp = JSON.stringify(settings);
    if (settingsStampRef.current !== stamp) {
      settingsStampRef.current = stamp;
      setLocal(settings);
    }
  }, [settings]);

  useEffect(() => {
    if (!defaultChatSettings) return;
    const stamp = JSON.stringify(defaultChatSettings);
    if (defaultRulesStampRef.current === stamp) return;
    defaultRulesStampRef.current = stamp;
    setDefaultRule(defaultChatSettings.rule);
    setDefaultNotes(defaultChatSettings.notes ?? "");
    setDefaultAiReply(defaultChatSettings.aiAutoReply);
    setDefaultSendCatalog(defaultChatSettings.sendCatalog);
    setDefaultNotify(defaultChatSettings.notifyOnReply);
    setDefaultInstructions(defaultChatSettings.customInstructions ?? "");
  }, [defaultChatSettings]);

  const set = (key: keyof BusinessSettings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setLocal((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSave = async (section: "profile" | "ai") => {
    try {
      await onUpdateSettings(local);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // syncError is set in the store
    }
  };

  const handleSaveDefaultRules = async () => {
    const payload = {
      rule: defaultRule,
      notes: defaultNotes.trim() || null,
      aiAutoReply: defaultAiReply,
      sendCatalog: defaultSendCatalog,
      notifyOnReply: defaultNotify,
      customInstructions: defaultInstructions.trim() || null,
    };
    await onSaveDefaultChatSettings(payload);
    defaultRulesStampRef.current = JSON.stringify({
      chatId: defaultChatSettings?.chatId ?? "__default__",
      ...payload,
    });
    setDefaultSaved(true);
    setTimeout(() => setDefaultSaved(false), 2000);
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-base)",
        overflowY: "auto",
        padding: "72px 32px 28px",
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-0)" }}>Business Settings</h1>
          {saved && (
            <div
              className="animate-fade-up"
              style={{
                background: "var(--wa-green-glow)",
                border: "1px solid var(--wa-green)",
                color: "var(--wa-green)",
                padding: "7px 16px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              ✓ Saved successfully
            </div>
          )}
        </div>
        <p style={{ fontSize: 13, color: "var(--text-2)" }}>
          Configure your AI agent personality, products, and business information.
        </p>
      </div>

      {/* Business Profile */}
      <SettingsSection title="Business Profile" subtitle="Your business identity — the AI uses this context in every conversation">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <FormInput label="Business Name" value={local.name} onChange={set("name")} placeholder="e.g. Obi's Electronics" />
          <FormInput label="Website / Store Link" value={local.website} onChange={set("website")} placeholder="https://..." />
        </div>
        {onOpenWebsite ? (
          <div
            style={{
              marginBottom: 14,
              padding: "14px 16px",
              borderRadius: "var(--radius-sm)",
              background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(37,211,102,0.08))",
              border: "1px solid rgba(59,130,246,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-0)", marginBottom: 4 }}>
                Need a professional business website?
              </div>
              <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5, maxWidth: 420 }}>
                Landing pages from ₦50,000 — customers shop your products online, with analytics & full e-commerce at higher tiers.
              </p>
            </div>
            <PrimaryBtn variant="green" onClick={onOpenWebsite}>
              View packages
            </PrimaryBtn>
          </div>
        ) : null}
        <div style={{ marginBottom: 14 }}>
          <FormTextarea
            label="What You Sell"
            value={local.description}
            onChange={set("description")}
            placeholder="Brief description of your products/services..."
            style={{ minHeight: 60 }}
          />
        </div>
        <FormInput label="Business Address" value={local.address} onChange={set("address")} placeholder="Street, City, State" />
        <div style={{ marginTop: 16 }}>
          <PrimaryBtn
            variant="green"
            onClick={() => void handleSave("profile")}
            style={{ opacity: savingBusinessSettings ? 0.7 : 1 }}
          >
            {savingBusinessSettings ? "Saving…" : "Save Profile"}
          </PrimaryBtn>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Default chat rules"
        subtitle="Applied to any chat without its own saved rules (stored per your account)"
      >
        <SectionLabel>Default reply rule</SectionLabel>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {(["default", "always", "never", "custom"] as ContactRule[]).map((rule) => (
            <button
              key={rule}
              type="button"
              onClick={() => setDefaultRule(rule)}
              style={{
                padding: "7px 14px",
                borderRadius: 99,
                border: defaultRule === rule ? "1px solid var(--wa-green)" : "1px solid var(--border-2)",
                background: defaultRule === rule ? "var(--wa-green-glow)" : "transparent",
                color: defaultRule === rule ? "var(--wa-green)" : "var(--text-2)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {rule}
            </button>
          ))}
        </div>

        <div
          style={{
            background: "var(--bg-2)",
            border: "1px solid var(--border-1)",
            borderRadius: "var(--radius-sm)",
            padding: "4px 12px",
            marginBottom: 14,
          }}
        >
          <Toggle label="AI auto-reply (default)" checked={defaultAiReply} onChange={setDefaultAiReply} />
          <Toggle label="Send product catalog (default)" checked={defaultSendCatalog} onChange={setDefaultSendCatalog} />
          <Toggle label="Notify on reply (default)" checked={defaultNotify} onChange={setDefaultNotify} />
        </div>

        <FormTextarea
          label="Default notes"
          value={defaultNotes}
          onChange={(e) => setDefaultNotes(e.target.value)}
          placeholder="Notes applied when a chat has no custom notes..."
          style={{ minHeight: 60, marginBottom: 14 }}
        />

        <FormTextarea
          label="Default AI instructions"
          value={defaultInstructions}
          onChange={(e) => setDefaultInstructions(e.target.value)}
          placeholder="Default custom instructions for chats using the default rule..."
          style={{ minHeight: 90, marginBottom: 14 }}
        />

        <PrimaryBtn
          variant="green"
          onClick={() => void handleSaveDefaultRules()}
          style={{ opacity: savingDefaultSettings ? 0.7 : 1 }}
        >
          {savingDefaultSettings ? "Saving…" : defaultSaved ? "Default rules saved ✓" : "Save default chat rules"}
        </PrimaryBtn>
      </SettingsSection>

      {/* AI Writing Rules */}
      <SettingsSection title="AI Writing Rules" subtitle="How the AI should communicate with your customers">
        <div style={{ marginBottom: 14 }}>
          <FormTextarea
            label="Global Instructions"
            value={local.aiRules}
            onChange={set("aiRules")}
            style={{ minHeight: 130 }}
          />
        </div>

        <SectionLabel>Response Tone</SectionLabel>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {TONES.map((tone) => {
            const isActive = local.tone === tone;
            return (
              <button
                key={tone}
                type="button"
                onClick={() => setLocal((p) => ({ ...p, tone }))}
                style={{
                  padding: "7px 16px",
                  borderRadius: 99,
                  border: isActive ? "1px solid var(--wa-green)" : "1px solid var(--border-2)",
                  background: isActive ? "var(--wa-green-glow)" : "transparent",
                  color: isActive ? "var(--wa-green)" : "var(--text-2)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  textTransform: "capitalize",
                  transition: "all 0.15s",
                }}
              >
                {tone}
              </button>
            );
          })}
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 10, fontWeight: 700, color: "var(--text-2)", letterSpacing: "0.5px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
            Response Language
          </label>
          <select
            value={local.responseLanguage}
            onChange={set("responseLanguage")}
            style={{
              width: "100%",
              background: "var(--bg-2)",
              border: "1px solid var(--border-1)",
              borderRadius: "var(--radius-xs)",
              padding: "9px 12px",
              fontSize: 13,
              color: "var(--text-0)",
              fontFamily: "var(--font-sans)",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="auto">Auto-detect (match customer language)</option>
            <option value="english">English only</option>
            <option value="yoruba">Yoruba only</option>
            <option value="igbo">Igbo only</option>
            <option value="hausa">Hausa only</option>
            <option value="pidgin">Nigerian Pidgin only</option>
          </select>
        </div>

        <FormTextarea
          label="Escalate to Owner When"
          value={local.escalationRules}
          onChange={set("escalationRules")}
          placeholder="e.g. Customer requests a refund, order over ₦500,000..."
          style={{ minHeight: 70 }}
        />

        <div style={{ marginTop: 16 }}>
          <PrimaryBtn
            variant="green"
            onClick={() => void handleSave("ai")}
            style={{ opacity: savingBusinessSettings ? 0.7 : 1 }}
          >
            {savingBusinessSettings ? "Saving…" : "Save AI Rules"}
          </PrimaryBtn>
        </div>
      </SettingsSection>

      {/* Product catalog — managed in Products tab */}
      <SettingsSection
        title="Product Store"
        subtitle="Create products with images, prices, and checkout links for AI to recommend"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            padding: "16px 18px",
            background: "var(--bg-2)",
            border: "1px solid var(--border-1)",
            borderRadius: "var(--radius-sm)",
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-0)", marginBottom: 4 }}>
              Manage your catalog
            </div>
            <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5, maxWidth: 420 }}>
              Add products in the Products tab. When customers ask on WhatsApp, AI searches your catalog and sends checkout links automatically.
            </p>
          </div>
          {onOpenProducts ? (
            <PrimaryBtn variant="green" onClick={onOpenProducts}>
              Open Products
            </PrimaryBtn>
          ) : null}
        </div>
      </SettingsSection>

      {/* AI Agent Controls */}
      <SettingsSection title="AI Agent Controls" subtitle="Global on/off switches for the AI system">
        <div
          style={{
            background: "var(--bg-2)",
            border: "1px solid var(--border-1)",
            borderRadius: "var(--radius-sm)",
            padding: "4px 14px",
          }}
        >
          {[
            { label: "Global AI Auto-Reply", val: aiEnabled, set: setAiEnabled, desc: "Master toggle for the entire AI agent" },
            { label: "Reply outside business hours", val: outsideHours, set: setOutsideHours, desc: "AI responds even when you're offline" },
            { label: "Notify me when AI can't answer", val: notifyFail, set: setNotifyFail, desc: "Get alerted for unhandled queries" },
            { label: "Send read receipts", val: sendReceipts, set: setSendReceipts, desc: "Show blue ticks on AI messages" },
          ].map((item, i, arr) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 0",
                borderBottom: i < arr.length - 1 ? "1px solid var(--border-1)" : "none",
              }}
            >
              <div>
                <div style={{ fontSize: 13, color: "var(--text-0)", fontWeight: 500, marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: "var(--text-2)" }}>{item.desc}</div>
              </div>
              <Toggle checked={item.val} onChange={item.set} />
            </div>
          ))}
        </div>
      </SettingsSection>

      {/* Danger zone */}
      <SettingsSection title="Danger Zone" subtitle="Irreversible actions — proceed with caution">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <PrimaryBtn variant="danger" size="sm">Reset All AI Rules</PrimaryBtn>
          <PrimaryBtn variant="danger" size="sm">Clear Conversation History</PrimaryBtn>
          <PrimaryBtn variant="ghost" size="sm">Export Data</PrimaryBtn>
        </div>
      </SettingsSection>
    </div>
  );
}
