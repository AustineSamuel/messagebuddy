"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { DailyCredits } from "@/dashboard/types";
import {
  getAnalyticsSummary,
  getHourlyVolume,
  getRecentMessages,
  getTopContacts,
  type AnalyticsPeriod,
  type RecentMessage,
  type TopContact,
} from "@/app/services/analytics";
import { getCreditsUsage } from "@/app/services/credits";
import { getErrorMessage } from "@/app/lib/api";

const PERIOD_OPTIONS: { key: AnalyticsPeriod; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
];

interface KpiCardProps {
  label: string;
  value: string | number;
  sub: string;
  trend?: string;
  trendUp?: boolean;
  accent: string;
}

function KpiCard({ label, value, sub, trend, trendUp, accent }: KpiCardProps) {
  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border-1)",
        borderRadius: "var(--radius-md)",
        padding: "16px 18px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: accent, opacity: 0.05, borderRadius: "inherit" }} />
      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-2)", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-0)", lineHeight: 1, marginBottom: 6 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: "var(--text-2)", display: "flex", alignItems: "center", gap: 5 }}>
        {trend ? (
          <span style={{ fontWeight: 700, color: trendUp ? "var(--emerald)" : "var(--red)" }}>
            {trendUp ? "↑" : "↓"} {trend}
          </span>
        ) : null}
        {sub}
      </div>
    </div>
  );
}

function BarChart({ data }: { data: DailyCredits[] }) {
  const max = Math.max(...data.map((d) => d.used), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 100, paddingBottom: 24, position: "relative" }}>
      {data.map((d, i) => {
        const pct = Math.round((d.used / max) * 100);
        const isLast = i === data.length - 1;
        return (
          <div key={`${d.day}-${d.date}`} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end", position: "relative", gap: 2 }}>
            <div
              title={`${d.day} ${d.date}: ${d.used} credits, ${d.messages} messages`}
              style={{
                width: "100%",
                borderRadius: "4px 4px 0 0",
                background: isLast ? "var(--wa-green)" : "var(--blue)",
                opacity: isLast ? 1 : 0.55,
                height: `${pct}%`,
                minHeight: 4,
                cursor: "pointer",
                transition: "opacity 0.15s",
              }}
            />
            <div style={{ fontSize: 10, color: "var(--text-2)", position: "absolute", bottom: -18 }}>
              {d.day}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HourlyBar({ data }: { data: number[] }) {
  const labels = Array.from({ length: 24 }, (_, i) => (i % 4 === 0 ? `${i}h` : ""));
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 80, paddingBottom: 20, position: "relative" }}>
      {data.map((v, i) => {
        const pct = Math.round((v / max) * 100);
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end", position: "relative" }}>
            <div
              style={{
                width: "100%",
                borderRadius: "2px 2px 0 0",
                background: v > 0 ? "var(--wa-green)" : "var(--bg-3)",
                opacity: v > 0 ? 0.75 : 0.3,
                height: `${pct}%`,
                minHeight: 2,
              }}
              title={`${i}:00 — ${v} msgs`}
            />
            {labels[i] ? (
              <div style={{ fontSize: 9, color: "var(--text-2)", position: "absolute", bottom: -18 }}>
                {labels[i]}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function initialsFromLabel(label: string) {
  const parts = label.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return label.slice(0, 2).toUpperCase();
}

type Props = {
  onBuyCredits?: () => void;
};

export default function DashboardAnalytics({ onBuyCredits }: Props) {
  const [period, setPeriod] = useState<AnalyticsPeriod>("7d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof getAnalyticsSummary>> | null>(null);
  const [dailyUsage, setDailyUsage] = useState<DailyCredits[]>([]);
  const [hourly, setHourly] = useState<number[]>(Array(24).fill(0));
  const [topContacts, setTopContacts] = useState<TopContact[]>([]);
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);

  const chartDays = period === "today" ? 1 : period === "30d" ? 30 : 7;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sum, usage, hourlyData, top, recent] = await Promise.all([
        getAnalyticsSummary(period),
        getCreditsUsage(chartDays),
        getHourlyVolume(),
        getTopContacts(period, 5),
        getRecentMessages(6),
      ]);
      setSummary(sum);
      setDailyUsage(usage);
      setHourly(hourlyData.hours);
      setTopContacts(top);
      setRecentMessages(recent);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [period, chartDays]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalUsed = useMemo(
    () => dailyUsage.reduce((a, b) => a + b.used, 0),
    [dailyUsage]
  );

  const topMax = topContacts[0]?.messages ?? 1;

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-base)",
        overflowY: "auto",
        padding: "72px 40px 32px",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, flexWrap: "wrap", gap: 12 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-0)" }}>Analytics</h1>
          <div style={{ display: "flex", gap: 6 }}>
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setPeriod(opt.key)}
                style={{
                  padding: "7px 16px",
                  borderRadius: 99,
                  border: period === opt.key ? "1px solid var(--wa-green)" : "1px solid var(--border-1)",
                  background: period === opt.key ? "var(--wa-green-glow)" : "transparent",
                  color: period === opt.key ? "var(--wa-green)" : "var(--text-2)",
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
        </div>
        <p style={{ fontSize: 14, color: "var(--text-2)" }}>
          Live credit usage and messaging activity from your account
        </p>
      </div>

      {error ? (
        <div style={{ marginBottom: 16, padding: 12, borderRadius: 10, background: "var(--red-muted)", border: "1px solid var(--red)", color: "var(--red)", fontSize: 13 }}>
          {error}
        </div>
      ) : null}

      {loading && !summary ? (
        <div style={{ padding: 60, textAlign: "center", color: "var(--text-2)" }}>Loading analytics…</div>
      ) : summary ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
            <KpiCard
              label="Credits Balance"
              value={summary.balance.toLocaleString(undefined, { maximumFractionDigits: 1 })}
              sub={`of ${summary.signupGrant.toLocaleString()} signup grant`}
              accent="var(--wa-green)"
            />
            <KpiCard
              label="Messages Sent"
              value={summary.messagesSent}
              sub={`in selected period`}
              trend={`${Math.abs(summary.messagesTrendPct)}%`}
              trendUp={summary.messagesTrendPct >= 0}
              accent="var(--blue)"
            />
            <KpiCard
              label="Credits Used"
              value={summary.creditsUsed.toLocaleString(undefined, { maximumFractionDigits: 1 })}
              sub={`${summary.creditsPerMessage} per message`}
              accent="var(--amber)"
            />
            <KpiCard
              label="Active Chats"
              value={summary.activeChats}
              sub={`${summary.aiMessages} AI messages`}
              accent="var(--purple)"
            />
          </div>

          <div
            style={{
              background: "var(--surface-1)",
              border: "1px solid var(--border-1)",
              borderRadius: "var(--radius-md)",
              padding: "20px 24px",
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-0)", marginBottom: 3 }}>
                  Credits Used Per Day
                </h3>
                <p style={{ fontSize: 12, color: "var(--text-2)" }}>
                  {totalUsed.toLocaleString(undefined, { maximumFractionDigits: 1 })} total in range
                </p>
              </div>
              {onBuyCredits ? (
                <button
                  type="button"
                  onClick={onBuyCredits}
                  style={{
                    background: "var(--wa-green)",
                    border: "none",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "8px 16px",
                    borderRadius: 99,
                    cursor: "pointer",
                  }}
                >
                  Buy credits
                </button>
              ) : null}
            </div>
            {dailyUsage.length > 0 ? <BarChart data={dailyUsage} /> : (
              <div style={{ padding: 32, textAlign: "center", color: "var(--text-2)", fontSize: 13 }}>
                No usage recorded yet. Send messages to see your chart.
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 16 }}>
            <div style={{ background: "var(--surface-1)", border: "1px solid var(--border-1)", borderRadius: "var(--radius-md)", padding: "16px 20px" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-0)", marginBottom: 14 }}>Most Active Contacts</h3>
              {topContacts.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--text-2)" }}>No messages in this period.</p>
              ) : (
                topContacts.map((c, i) => (
                  <div key={c.chatId} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < topContacts.length - 1 ? "1px solid var(--border-1)" : "none" }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--bg-3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "var(--text-0)", flexShrink: 0 }}>
                      {initialsFromLabel(c.chatLabel)}
                    </div>
                    <div style={{ flex: 1, fontSize: 13, color: "var(--text-0)", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.chatLabel}</div>
                    <div style={{ fontSize: 12, color: "var(--text-2)", fontWeight: 600 }}>{c.messages} msgs</div>
                    <div style={{ width: 60, height: 4, background: "var(--bg-3)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ width: `${(c.messages / topMax) * 100}%`, height: "100%", background: "var(--wa-green)", borderRadius: 99 }} />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ background: "var(--surface-1)", border: "1px solid var(--border-1)", borderRadius: "var(--radius-md)", padding: "16px 20px" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-0)", marginBottom: 14 }}>Recent Messages</h3>
              {recentMessages.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--text-2)" }}>No outbound messages yet.</p>
              ) : (
                recentMessages.map((msg, i) => (
                  <div key={msg.id} style={{ padding: "8px 0", borderBottom: i < recentMessages.length - 1 ? "1px solid var(--border-1)" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--wa-green)" }}>{msg.chatLabel}</span>
                      <span style={{ fontSize: 10, color: "var(--text-2)" }}>• {formatTime(msg.createdAt)}</span>
                      {msg.isAi ? (
                        <span style={{ background: "var(--wa-green-glow)", color: "var(--wa-green)", fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 3, marginLeft: "auto" }}>AI</span>
                      ) : null}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {msg.preview || "—"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={{ background: "var(--surface-1)", border: "1px solid var(--border-1)", borderRadius: "var(--radius-md)", padding: "20px 24px" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-0)", marginBottom: 16 }}>
              Message Volume by Hour
              <span style={{ fontSize: 12, color: "var(--text-2)", fontWeight: 400, marginLeft: 8 }}>today</span>
            </h3>
            <HourlyBar data={hourly} />
          </div>
        </>
      ) : null}
    </div>
  );
}
