"use client";

import { memo, useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { Avatar, Badge, PrimaryBtn } from "@/dashboard/components/ui/primitives";
import { getErrorMessage } from "@/app/lib/api";
import {
  FOLLOW_UP_INTERVAL_DESCRIPTIONS,
  FOLLOW_UP_INTERVAL_LABELS,
  getFollowUpSchedules,
  syncFollowUpSchedules,
  type FollowUpInterval,
  type FollowUpSchedule,
} from "@/app/services/follow-ups";
import { dedupeContactsById } from "@/dashboard/lib/contacts";
import type { Contact } from "@/dashboard/types";

type Props = {
  contacts: Contact[];
};

type PageTab = "selected" | "add";

const INTERVALS: FollowUpInterval[] = ["daily", "every_3_days", "weekly"];

const TABS: { key: PageTab; label: string }[] = [
  { key: "selected", label: "Selected contacts" },
  { key: "add", label: "Add contacts" },
];

function formatWhen(iso: string | null) {
  if (!iso) return "—";
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function chatIdLabel(chatId: string) {
  return chatId.replace(/@c\.us$/, "");
}

type IntervalPillsProps = {
  value: FollowUpInterval;
  onChange: (interval: FollowUpInterval) => void;
  compact?: boolean;
};

const IntervalPills = memo(function IntervalPills({ value, onChange, compact }: IntervalPillsProps) {
  return (
    <div style={{ display: "flex", gap: compact ? 6 : 8, flexWrap: "wrap" }}>
      {INTERVALS.map((key) => {
        const isActive = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            style={{
              padding: compact ? "6px 12px" : "8px 14px",
              borderRadius: 99,
              border: isActive ? "1px solid var(--wa-green)" : "1px solid var(--border-2)",
              background: isActive ? "var(--wa-green-glow)" : "var(--bg-2)",
              color: isActive ? "var(--wa-green)" : "var(--text-2)",
              fontSize: compact ? 11 : 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              whiteSpace: "nowrap",
            }}
          >
            {FOLLOW_UP_INTERVAL_LABELS[key]}
          </button>
        );
      })}
    </div>
  );
});

type SelectedContactCardProps = {
  chatId: string;
  contact: Contact | undefined;
  interval: FollowUpInterval;
  schedule: FollowUpSchedule | undefined;
  onIntervalChange: (chatId: string, interval: FollowUpInterval) => void;
  onRemove: (chatId: string) => void;
};

const SelectedContactCard = memo(function SelectedContactCard({
  chatId,
  contact,
  interval,
  schedule,
  onIntervalChange,
  onRemove,
}: SelectedContactCardProps) {
  const handleInterval = useCallback(
    (next: FollowUpInterval) => onIntervalChange(chatId, next),
    [chatId, onIntervalChange]
  );

  const handleRemove = useCallback(() => onRemove(chatId), [chatId, onRemove]);

  const displayName = contact?.name ?? chatIdLabel(chatId);
  const displayPhone = contact?.phone ?? chatIdLabel(chatId);

  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border-1)",
        borderRadius: 16,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        {contact ? (
          <Avatar initials={contact.initials} color={contact.avatarColor} size={48} />
        ) : (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "var(--bg-3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              color: "var(--text-2)",
              flexShrink: 0,
            }}
          >
            ?
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-0)", marginBottom: 4 }}>
            {displayName}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-2)" }}>{displayPhone}</div>
          {schedule?.nextRunAt ? (
            <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 6 }}>
              Next follow-up: {formatWhen(schedule.nextRunAt)}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 6 }}>
              Saves on next sync
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleRemove}
          title="Remove from follow-ups"
          style={{
            background: "var(--bg-2)",
            border: "1px solid var(--border-1)",
            borderRadius: 8,
            color: "var(--text-2)",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            padding: "6px 12px",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--red)";
            e.currentTarget.style.color = "var(--red)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-1)";
            e.currentTarget.style.color = "var(--text-2)";
          }}
        >
          Remove
        </button>
      </div>

      <div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.6px",
            textTransform: "uppercase",
            color: "var(--text-2)",
            marginBottom: 8,
          }}
        >
          Follow-up schedule
        </div>
        <IntervalPills value={interval} onChange={handleInterval} />
        <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 8 }}>
          {FOLLOW_UP_INTERVAL_DESCRIPTIONS[interval]}
        </div>
      </div>
    </div>
  );
});

type AddContactRowProps = {
  contact: Contact;
  isSelected: boolean;
  onToggle: (id: string) => void;
};

const AddContactRow = memo(function AddContactRow({ contact, isSelected, onToggle }: AddContactRowProps) {
  const handleClick = useCallback(() => onToggle(contact.id), [contact.id, onToggle]);

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "16px 20px",
        border: "none",
        borderBottom: "1px solid var(--border-1)",
        background: isSelected ? "var(--wa-green-glow)" : "transparent",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: 7,
          border: isSelected ? "2px solid var(--wa-green)" : "2px solid var(--border-2)",
          background: isSelected ? "var(--wa-green)" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {isSelected ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" width={12} height={12}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : null}
      </div>
      <Avatar initials={contact.initials} color={contact.avatarColor} size={44} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-0)" }}>{contact.name}</div>
        <div style={{ fontSize: 12, color: "var(--text-2)" }}>{contact.phone}</div>
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: isSelected ? "var(--wa-green)" : "var(--text-3)" }}>
        {isSelected ? "Added" : "Add"}
      </span>
    </button>
  );
});

export default function FollowUpsPage({ contacts }: Props) {
  const [activeTab, setActiveTab] = useState<PageTab>("selected");
  const [defaultInterval, setDefaultInterval] = useState<FollowUpInterval>("every_3_days");
  const [selectedEntries, setSelectedEntries] = useState<Map<string, FollowUpInterval>>(new Map());
  const [schedules, setSchedules] = useState<FollowUpSchedule[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deferredSearch = useDeferredValue(search);
  const uniqueContacts = useMemo(() => dedupeContactsById(contacts), [contacts]);

  const contactById = useMemo(() => {
    const map = new Map<string, Contact>();
    for (const contact of uniqueContacts) map.set(contact.id, contact);
    return map;
  }, [uniqueContacts]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await getFollowUpSchedules();
      setSchedules(rows);
      const active = rows.filter((r) => r.enabled);
      if (active.length > 0) {
        setDefaultInterval(active[0].interval);
        setSelectedEntries(new Map(active.map((r) => [r.chatId, r.interval])));
        setEnabled(true);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const scheduleByChat = useMemo(() => {
    const map = new Map<string, FollowUpSchedule>();
    for (const row of schedules) map.set(row.chatId, row);
    return map;
  }, [schedules]);

  const selectedList = useMemo(
    () =>
      [...selectedEntries.entries()].map(([chatId, interval]) => ({
        chatId,
        interval,
        contact: contactById.get(chatId),
        schedule: scheduleByChat.get(chatId),
      })),
    [selectedEntries, contactById, scheduleByChat]
  );

  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    return uniqueContacts.filter((c) => {
      if (c.isGroup) return false;
      if (!q) return true;
      return c.name.toLowerCase().includes(q) || c.phone.includes(q);
    });
  }, [uniqueContacts, deferredSearch]);

  const activeCount = useMemo(
    () => schedules.reduce((count, row) => count + (row.enabled ? 1 : 0), 0),
    [schedules]
  );

  const toggleContact = useCallback(
    (id: string) => {
      setSelectedEntries((prev) => {
        const next = new Map(prev);
        if (next.has(id)) next.delete(id);
        else next.set(id, defaultInterval);
        return next;
      });
    },
    [defaultInterval]
  );

  const updateSelectedInterval = useCallback((chatId: string, interval: FollowUpInterval) => {
    setSelectedEntries((prev) => {
      const next = new Map(prev);
      if (!next.has(chatId)) return prev;
      next.set(chatId, interval);
      return next;
    });
  }, []);

  const removeSelected = useCallback((chatId: string) => {
    setSelectedEntries((prev) => {
      const next = new Map(prev);
      next.delete(chatId);
      return next;
    });
  }, []);

  const selectAllVisible = useCallback(() => {
    setSelectedEntries((prev) => {
      const next = new Map(prev);
      for (const contact of filtered) next.set(contact.id, next.get(contact.id) ?? defaultInterval);
      return next;
    });
  }, [filtered, defaultInterval]);

  const clearAll = useCallback(() => {
    setSelectedEntries(new Map());
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const savedRows = await syncFollowUpSchedules({
        contacts: [...selectedEntries.entries()].map(([chatId, interval]) => ({ chatId, interval })),
        enabled,
      });
      setSchedules(savedRows);
      const active = savedRows.filter((r) => r.enabled);
      setSelectedEntries(new Map(active.map((r) => [r.chatId, r.interval])));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }, [enabled, selectedEntries]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

  const handleEnabledChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEnabled(e.target.checked);
  }, []);

  const goToAddTab = useCallback(() => setActiveTab("add"), []);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-base)",
        overflow: "hidden",
        minWidth: 0,
        paddingTop: 56,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 40px 0",
          borderBottom: "1px solid var(--border-1)",
          background: "var(--bg-1)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 20,
            marginBottom: 18,
          }}
        >
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-0)", marginBottom: 8 }}>
              AI Follow-ups
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-2)", maxWidth: 640, lineHeight: 1.55 }}>
              Manage who gets automatic check-ins. Each contact can have their own schedule — daily, every 3 days, or weekly.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0, paddingTop: 4 }}>
            <Badge variant="green">{activeCount} active</Badge>
            <Badge variant="gray">{selectedEntries.size} selected</Badge>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4 }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = tab.key === "selected" ? selectedEntries.size : undefined;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: "12px 20px",
                  background: "none",
                  border: "none",
                  borderBottom: isActive ? "2px solid var(--wa-green)" : "2px solid transparent",
                  color: isActive ? "var(--wa-green)" : "var(--text-2)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  marginBottom: -1,
                }}
              >
                {tab.label}
                {count !== undefined && count > 0 ? ` (${count})` : ""}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content — full remaining height */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {error ? (
          <div
            style={{
              margin: "16px 40px 0",
              padding: "12px 16px",
              borderRadius: 10,
              background: "var(--red-muted)",
              border: "1px solid var(--red)",
              color: "var(--red)",
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            {error}
          </div>
        ) : null}

        {activeTab === "selected" ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              padding: "20px 40px",
            }}
          >
            {selectedList.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  marginBottom: 14,
                  flexShrink: 0,
                }}
              >
                <button
                  type="button"
                  onClick={clearAll}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--red)",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: "6px 8px",
                  }}
                >
                  Remove all
                </button>
              </div>
            ) : null}

            <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
              {loading ? (
                <div style={{ padding: 60, textAlign: "center", color: "var(--text-2)", fontSize: 14 }}>
                  Loading schedules…
                </div>
              ) : selectedList.length === 0 ? (
                <div
                  style={{
                    padding: "60px 24px",
                    textAlign: "center",
                    border: "1px dashed var(--border-2)",
                    borderRadius: 16,
                    background: "var(--surface-1)",
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-0)", marginBottom: 8 }}>
                    No contacts selected yet
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 20, lineHeight: 1.5 }}>
                    Go to the Add contacts tab to pick who should receive AI follow-ups.
                  </p>
                  <PrimaryBtn variant="green" onClick={goToAddTab}>
                    Add contacts
                  </PrimaryBtn>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                    gap: 16,
                    paddingBottom: 8,
                  }}
                >
                  {selectedList.map((item) => (
                    <SelectedContactCard
                      key={item.chatId}
                      chatId={item.chatId}
                      contact={item.contact}
                      interval={item.interval}
                      schedule={item.schedule}
                      onIntervalChange={updateSelectedInterval}
                      onRemove={removeSelected}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              padding: "20px 40px",
            }}
          >
            <div
              style={{
                background: "var(--surface-1)",
                border: "1px solid var(--border-1)",
                borderRadius: 14,
                padding: "16px 18px",
                marginBottom: 16,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.6px",
                  textTransform: "uppercase",
                  color: "var(--text-2)",
                  marginBottom: 10,
                }}
              >
                Default schedule for newly added contacts
              </div>
              <IntervalPills value={defaultInterval} onChange={setDefaultInterval} />
              <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 10, lineHeight: 1.5 }}>
                You can change each contact&apos;s schedule individually in the Selected contacts tab.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 14,
                flexShrink: 0,
              }}
            >
              <input
                value={search}
                onChange={handleSearchChange}
                placeholder="Search by name or phone…"
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 12,
                  border: "1px solid var(--border-1)",
                  background: "var(--bg-2)",
                  padding: "0 16px",
                  fontSize: 14,
                  color: "var(--text-0)",
                  outline: "none",
                }}
              />
              <button
                type="button"
                onClick={selectAllVisible}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--wa-green)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: "10px 12px",
                  whiteSpace: "nowrap",
                }}
              >
                Add all visible
              </button>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                minHeight: 0,
                border: "1px solid var(--border-1)",
                borderRadius: 14,
                background: "var(--surface-1)",
              }}
            >
              {loading ? (
                <div style={{ padding: 60, textAlign: "center", color: "var(--text-2)", fontSize: 14 }}>
                  Loading contacts…
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: 60, textAlign: "center", color: "var(--text-2)", fontSize: 14 }}>
                  No contacts found.
                </div>
              ) : (
                filtered.map((contact) => (
                  <AddContactRow
                    key={contact.id}
                    contact={contact}
                    isSelected={selectedEntries.has(contact.id)}
                    onToggle={toggleContact}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* Sticky footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            padding: "16px 40px 20px",
            borderTop: "1px solid var(--border-1)",
            background: "var(--bg-1)",
            flexShrink: 0,
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 14,
              color: "var(--text-1)",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={enabled}
              onChange={handleEnabledChange}
              style={{ width: 17, height: 17, accentColor: "var(--wa-green)" }}
            />
            Enable follow-ups for selected contacts
          </label>
          <PrimaryBtn
            variant="green"
            onClick={() => void handleSave()}
            style={{ minWidth: 180, opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Saving…" : saved ? "Saved ✓" : "Save follow-ups"}
          </PrimaryBtn>
        </div>
      </div>
    </div>
  );
}
