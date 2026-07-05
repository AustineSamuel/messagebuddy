"use client";

import { useState, useEffect, useRef } from "react";
import InstallAppButton from "@/app/components/InstallAppButton";
import StoreLinkShare from "@/dashboard/components/settings/StoreLinkShare";
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
  whatsappConnected?: boolean;
  onLogoutWhatsApp?: () => Promise<void>;
  onLogoutAccount?: () => Promise<void>;
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
  whatsappConnected = false,
  onLogoutWhatsApp,
  onLogoutAccount,
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
  const [storeSaved, setStoreSaved] = useState(false);
  const [defaultSaved, setDefaultSaved] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [loggingOutWhatsApp, setLoggingOutWhatsApp] = useState(false);
  const [loggingOutAccount, setLoggingOutAccount] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

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

  const setOptional = (key: keyof BusinessSettings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value.trim();
    setLocal((prev) => ({ ...prev, [key]: value || null }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 800_000) {
      window.alert("Logo must be under 800KB. Try a smaller image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLocal((prev) => ({ ...prev, logoUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const previewStoreUrl =
    local.storeUrl ||
    (local.slug ? `${typeof window !== "undefined" ? window.location.origin : ""}/${local.slug}` : "");

  const handleCopyStoreLink = async () => {
    if (!previewStoreUrl) return;
    try {
      await navigator.clipboard.writeText(previewStoreUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      window.prompt("Copy your store link:", previewStoreUrl);
    }
  };

  const handleSaveStore = async () => {
    try {
      await onUpdateSettings(local);
      setStoreSaved(true);
      setTimeout(() => setStoreSaved(false), 2000);
    } catch {
      // syncError is set in the store
    }
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

  const handleLogoutWhatsApp = async () => {
    if (!onLogoutWhatsApp) return;
    const confirmed = window.confirm(
      "Disconnect WhatsApp from MessageBuddy?\n\nThis unlinks your number from the server. You'll need to scan the QR code again to reconnect."
    );
    if (!confirmed) return;

    setSignOutError(null);
    setLoggingOutWhatsApp(true);
    try {
      await onLogoutWhatsApp();
    } catch {
      setSignOutError("Could not disconnect WhatsApp. Try again in a moment.");
    } finally {
      setLoggingOutWhatsApp(false);
    }
  };

  const handleLogoutAccount = async () => {
    if (!onLogoutAccount) return;
    const confirmed = window.confirm(
      "Sign out of MessageBuddy?\n\nThis disconnects WhatsApp and ends your account session on this device."
    );
    if (!confirmed) return;

    setSignOutError(null);
    setLoggingOutAccount(true);
    try {
      await onLogoutAccount();
    } catch {
      setSignOutError("Could not sign out completely. Please try again.");
      setLoggingOutAccount(false);
    }
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

      <SettingsSection title="Install app" subtitle="Add MessageBuddy to your home screen for quick access like a native app">
        <InstallAppButton variant="settings" />
      </SettingsSection>

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
        title="Online store"
        subtitle="Your public storefront at yourdomain.com/your-store — products, contact details, and SEO"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 16,
            padding: "12px 14px",
            borderRadius: "var(--radius-sm)",
            background: "var(--surface-2)",
            border: "1px solid var(--border-1)",
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-0)" }}>Public store</div>
            <p style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>
              When off, your store link returns “not found”.
            </p>
          </div>
          <Toggle
            checked={local.publicStoreEnabled}
            onChange={(v) => setLocal((prev) => ({ ...prev, publicStoreEnabled: v }))}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <FormInput
            label="Store URL slug"
            value={local.slug ?? ""}
            onChange={setOptional("slug")}
            placeholder="obis-electronics"
          />
          <FormInput
            label="Contact phone"
            value={local.phone ?? ""}
            onChange={setOptional("phone")}
            placeholder="+234 801 234 5678"
          />
        </div>

        {previewStoreUrl ? (
          <StoreLinkShare
            url={previewStoreUrl}
            businessName={local.name}
            onCopy={handleCopyStoreLink}
            linkCopied={linkCopied}
          />
        ) : null}

        <FormInput
          label="Tagline"
          value={local.tagline ?? ""}
          onChange={setOptional("tagline")}
          placeholder="Quality electronics delivered fast"
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14, marginBottom: 14 }}>
          <div>
            <SectionLabel>Logo</SectionLabel>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
              {local.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={local.logoUrl}
                  alt="Logo preview"
                  style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover", border: "1px solid var(--border-1)" }}
                />
              ) : (
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 10,
                    background: "var(--surface-2)",
                    border: "1px dashed var(--border-1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                  }}
                >
                  🏪
                </div>
              )}
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--wa-green)", cursor: "pointer" }}>
                Upload logo
                <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
              </label>
            </div>
            <FormInput
              label="Or logo URL"
              value={local.logoUrl ?? ""}
              onChange={setOptional("logoUrl")}
              placeholder="https://..."
              style={{ marginTop: 10 }}
            />
          </div>
          <div>
            <SectionLabel>Accent color</SectionLabel>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
              <input
                type="color"
                value={local.accentColor || "#25D366"}
                onChange={(e) => setLocal((prev) => ({ ...prev, accentColor: e.target.value }))}
                style={{ width: 44, height: 36, border: "none", cursor: "pointer", borderRadius: 8 }}
              />
              <FormInput
                label=""
                value={local.accentColor || "#25D366"}
                onChange={set("accentColor")}
                placeholder="#25D366"
              />
            </div>
          </div>
        </div>

        <div style={{ marginTop: 4, marginBottom: 8 }}>
          <SectionLabel>SEO (search engines & social sharing)</SectionLabel>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14, marginBottom: 14 }}>
          <FormInput
            label="SEO title"
            value={local.seoTitle ?? ""}
            onChange={setOptional("seoTitle")}
            placeholder={`${local.name || "Your business"} — shop online`}
          />
          <FormTextarea
            label="SEO description"
            value={local.seoDescription ?? ""}
            onChange={setOptional("seoDescription")}
            placeholder="Short description for Google and WhatsApp link previews…"
            style={{ minHeight: 56 }}
          />
        </div>

        {onOpenProducts ? (
          <p style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 14 }}>
            Products shown on your store come from the{" "}
            <button
              type="button"
              onClick={onOpenProducts}
              style={{ background: "none", border: "none", padding: 0, color: "var(--wa-green)", fontWeight: 700, cursor: "pointer" }}
            >
              Products
            </button>{" "}
            tab — mark them active to publish.
          </p>
        ) : null}

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <PrimaryBtn
            variant="green"
            onClick={() => void handleSaveStore()}
            style={{ opacity: savingBusinessSettings ? 0.7 : 1 }}
          >
            {savingBusinessSettings ? "Saving…" : "Save store settings"}
          </PrimaryBtn>
          {storeSaved ? (
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--wa-green)" }}>✓ Saved</span>
          ) : null}
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

      {/* Sign out */}
      <SettingsSection title="Sign out" subtitle="Disconnect WhatsApp or end your MessageBuddy session">
        {signOutError ? (
          <div
            style={{
              marginBottom: 14,
              padding: "10px 14px",
              borderRadius: 8,
              background: "var(--red-muted)",
              border: "1px solid var(--red)",
              color: "var(--red)",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {signOutError}
          </div>
        ) : null}

        <div style={{ display: "grid", gap: 12 }}>
          <div className="settings-signout-card settings-signout-card--whatsapp">
            <div className="settings-signout-card__icon" aria-hidden>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.53 5.855L0 24l6.335-1.662A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82a9.82 9.82 0 0 1-5.01-1.37l-.36-.214-3.76.987 1.004-3.66-.234-.375A9.82 9.82 0 0 1 2.18 12C2.18 6.57 6.57 2.18 12 2.18S21.82 6.57 21.82 12 17.43 21.82 12 21.82z" />
              </svg>
            </div>
            <div className="settings-signout-card__body">
              <div className="settings-signout-card__title">Sign out WhatsApp</div>
              <p className="settings-signout-card__desc">
                Unlinks your number from whatsapp-web.js on the server. Your MessageBuddy account stays
                signed in — scan QR again to reconnect.
              </p>
              {whatsappConnected ? (
                <span className="settings-signout-card__badge settings-signout-card__badge--connected">
                  Connected
                </span>
              ) : (
                <span className="settings-signout-card__badge">Not connected</span>
              )}
            </div>
            <button
              type="button"
              className="settings-signout-btn settings-signout-btn--whatsapp"
              onClick={() => void handleLogoutWhatsApp()}
              disabled={!onLogoutWhatsApp || loggingOutWhatsApp}
            >
              {loggingOutWhatsApp ? "Disconnecting…" : "Sign out WhatsApp"}
            </button>
          </div>

          <div className="settings-signout-card settings-signout-card--account">
            <div className="settings-signout-card__icon settings-signout-card__icon--account" aria-hidden>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" />
                <polyline points="16 17 21 12 16 7" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" />
              </svg>
            </div>
            <div className="settings-signout-card__body">
              <div className="settings-signout-card__title">Sign out of MessageBuddy</div>
              <p className="settings-signout-card__desc">
                Ends your account session on this device and disconnects WhatsApp from the backend.
              </p>
            </div>
            <button
              type="button"
              className="settings-signout-btn settings-signout-btn--account"
              onClick={() => void handleLogoutAccount()}
              disabled={!onLogoutAccount || loggingOutAccount}
            >
              {loggingOutAccount ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}
