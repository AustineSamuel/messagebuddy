"use client";

import type { Message } from "@/dashboard/types";
import { DEMO_DAILY_CREDITS, DEMO_CONTACTS, DEMO_CONVERSATIONS } from "@/dashboard/data/demo";

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
        {trend && (
          <span style={{ fontWeight: 700, color: trendUp ? "var(--emerald)" : "var(--red)" }}>
            {trendUp ? "↑" : "↓"} {trend}
          </span>
        )}
        {sub}
      </div>
    </div>
  );
}

function BarChart({ data, colors }: { data: typeof DEMO_DAILY_CREDITS; colors?: string[] }) {
  const max = Math.max(...data.map((d) => d.used));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 100, paddingBottom: 24, position: "relative" }}>
      {data.map((d, i) => {
        const pct = Math.round((d.used / max) * 100);
        const isLast = i === data.length - 1;
        return (
          <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end", position: "relative", gap: 2 }}>
            <div
              title={`${d.day} ${d.date}: ${d.used} credits, ${d.messages} messages`}
              style={{
                width: "100%",
                borderRadius: "4px 4px 0 0",
                background: colors?.[i] ?? (isLast ? "var(--wa-green)" : "var(--blue)"),
                opacity: isLast ? 1 : 0.55,
                height: `${pct}%`,
                minHeight: 4,
                cursor: "pointer",
                transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = isLast ? "1" : "0.55")}
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

function HourlyBar() {
  const data = [8, 12, 6, 4, 18, 25, 32, 28, 22, 15, 12, 9, 7, 14, 18, 22, 30, 28, 24, 18, 12, 8, 5, 3];
  const labels = Array.from({ length: 24 }, (_, i) => (i % 4 === 0 ? `${i}h` : ""));
  const max = Math.max(...data);
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
                background: v > 20 ? "var(--wa-green)" : "var(--blue)",
                opacity: 0.65,
                height: `${pct}%`,
                minHeight: 2,
                transition: "opacity 0.15s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.65")}
              title={`${i}:00 — ${v} msgs`}
            />
            {labels[i] && (
              <div style={{ fontSize: 9, color: "var(--text-2)", position: "absolute", bottom: -18 }}>
                {labels[i]}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardAnalytics({ creditsBalance }: { creditsBalance: number }) {
  const totalUsedWeek = DEMO_DAILY_CREDITS.reduce((a, b) => a + b.used, 0);
  const totalMsgsWeek = DEMO_DAILY_CREDITS.reduce((a, b) => a + b.messages, 0);
  const todayData = DEMO_DAILY_CREDITS[DEMO_DAILY_CREDITS.length - 1];

  // Collect all AI messages across conversations
  const recentAiMsgs = Object.entries(DEMO_CONVERSATIONS)
    .flatMap(([cId, conv]) =>
      conv.messages
        .filter((m: Message) => m.aiGenerated && m.direction === "out")
        .map((m) => ({ ...m, contactId: cId }))
    )
    .slice(-5)
    .reverse();

  const contactMap = Object.fromEntries(DEMO_CONTACTS.map((c) => [c.id, c]));

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
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-0)" }}>Analytics</h1>
          <div style={{ display: "flex", gap: 6 }}>
            {["Today", "7 days", "30 days"].map((t, i) => (
              <button
                key={t}
                style={{
                  padding: "6px 14px",
                  borderRadius: 99,
                  border: i === 1 ? "1px solid var(--wa-green)" : "1px solid var(--border-1)",
                  background: i === 1 ? "var(--wa-green-glow)" : "transparent",
                  color: i === 1 ? "var(--wa-green)" : "var(--text-2)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-2)" }}>
          AI agent performance & credit usage — last 7 days
        </p>
      </div>

      {/* KPI Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        <KpiCard label="Credits Balance" value={creditsBalance.toLocaleString()} sub="of 5,000 plan" trend="143" trendUp={false} accent="var(--wa-green)" />
        <KpiCard label="AI Messages Sent" value={totalMsgsWeek} sub="this week" trend="18%" trendUp accent="var(--blue)" />
        <KpiCard label="Active Conversations" value={47} sub="today" trend="9" trendUp accent="var(--amber)" />
        <KpiCard label="Avg Response Time" value="1.4s" sub="per AI reply" trend="fast" trendUp accent="var(--purple)" />
      </div>

      {/* Credits chart */}
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
              {totalUsedWeek.toLocaleString()} total this week
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--text-2)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: "var(--blue)", opacity: 0.55 }} /> Past days
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: "var(--wa-green)" }} /> Today
            </span>
          </div>
        </div>
        <BarChart data={DEMO_DAILY_CREDITS} />

        {/* Day stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginTop: 12 }}>
          {DEMO_DAILY_CREDITS.map((d, i) => (
            <div
              key={d.day}
              style={{
                background: i === DEMO_DAILY_CREDITS.length - 1 ? "var(--wa-green-muted)" : "var(--bg-2)",
                border: `1px solid ${i === DEMO_DAILY_CREDITS.length - 1 ? "rgba(37,211,102,0.2)" : "var(--border-1)"}`,
                borderRadius: 6,
                padding: "6px 4px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-0)" }}>{d.used}</div>
              <div style={{ fontSize: 9, color: "var(--text-2)" }}>{d.day}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Most active contacts */}
        <div
          style={{
            background: "var(--surface-1)",
            border: "1px solid var(--border-1)",
            borderRadius: "var(--radius-md)",
            padding: "16px 20px",
          }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-0)", marginBottom: 14 }}>
            Most Active Contacts
          </h3>
          {[
            { name: "Amaka Kelechi", msgs: 34, initials: "AK", color: "#1e3a4a" },
            { name: "Chidi Uzodinma", msgs: 28, initials: "CU", color: "#1a2e50" },
            { name: "Fatima Abubakar", msgs: 21, initials: "FA", color: "#2e1a50" },
            { name: "Taiwo Makinde", msgs: 18, initials: "TM", color: "#1a3a3a" },
          ].map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < 3 ? "1px solid var(--border-1)" : "none" }}>
              <div
                style={{
                  width: 30, height: 30, borderRadius: "50%",
                  background: c.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 700, color: "var(--text-0)", flexShrink: 0,
                }}
              >
                {c.initials}
              </div>
              <div style={{ flex: 1, fontSize: 13, color: "var(--text-0)" }}>{c.name}</div>
              <div style={{ fontSize: 12, color: "var(--text-2)", fontWeight: 600 }}>{c.msgs} msgs</div>
              <div
                style={{
                  width: 60, height: 4, background: "var(--bg-3)", borderRadius: 99, overflow: "hidden",
                }}
              >
                <div style={{ width: `${(c.msgs / 34) * 100}%`, height: "100%", background: "var(--wa-green)", borderRadius: 99 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Recent AI messages */}
        <div
          style={{
            background: "var(--surface-1)",
            border: "1px solid var(--border-1)",
            borderRadius: "var(--radius-md)",
            padding: "16px 20px",
          }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-0)", marginBottom: 14 }}>
            Recent AI Messages
          </h3>
          {recentAiMsgs.map((msg, i) => {
            const contact = contactMap[msg.contactId];
            return (
              <div key={msg.id} style={{ padding: "8px 0", borderBottom: i < recentAiMsgs.length - 1 ? "1px solid var(--border-1)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--wa-green)" }}>
                    {contact?.name ?? "Unknown"}
                  </span>
                  <span style={{ fontSize: 10, color: "var(--text-2)" }}>• {msg.time}</span>
                  <span
                    style={{
                      background: "var(--wa-green-glow)",
                      color: "var(--wa-green)",
                      fontSize: 9,
                      fontWeight: 700,
                      padding: "1px 5px",
                      borderRadius: 3,
                      letterSpacing: "0.3px",
                      marginLeft: "auto",
                    }}
                  >
                    AI
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-1)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hourly chart */}
      <div
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--border-1)",
          borderRadius: "var(--radius-md)",
          padding: "20px 24px",
        }}
      >
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-0)", marginBottom: 16 }}>
          Message Volume by Hour
          <span style={{ fontSize: 12, color: "var(--text-2)", fontWeight: 400, marginLeft: 8 }}>today</span>
        </h3>
        <HourlyBar />
      </div>
    </div>
  );
}
