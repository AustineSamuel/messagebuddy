"use client";

type SkeletonProps = {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
};

export function SkeletonBlock({
  width = "100%",
  height = 12,
  borderRadius = 8,
  className,
  style,
}: SkeletonProps) {
  return (
    <div
      className={`wa-skeleton ${className ?? ""}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
}

export function ChatListSkeleton() {
  return (
    <div style={{ width: 300, flexShrink: 0, borderRight: "1px solid var(--border-1)", background: "var(--bg-1)", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--border-1)" }}>
        <SkeletonBlock width="45%" height={16} />
        <SkeletonBlock width="30%" height={10} style={{ marginTop: 8 }} />
      </div>
      <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border-1)" }}>
        <SkeletonBlock height={34} borderRadius={8} />
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 10,
              padding: "12px 16px",
              borderBottom: "1px solid var(--border-1)",
            }}
          >
            <SkeletonBlock width={42} height={42} borderRadius={21} />
            <div style={{ flex: 1 }}>
              <SkeletonBlock width="55%" height={12} />
              <SkeletonBlock width="80%" height={10} style={{ marginTop: 8 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChatAreaSkeleton() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "var(--bg-base)" }}>
      <div className="wa-pattern-bg" />
      <div
        style={{
          padding: "13px 20px",
          background: "var(--bg-1)",
          borderBottom: "1px solid var(--border-1)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          position: "relative",
          zIndex: 1,
        }}
      >
        <SkeletonBlock width={40} height={40} borderRadius={20} />
        <div style={{ flex: 1 }}>
          <SkeletonBlock width={120} height={14} />
          <SkeletonBlock width={80} height={10} style={{ marginTop: 6 }} />
        </div>
      </div>
      <div style={{ flex: 1, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12, position: "relative", zIndex: 1 }}>
        {[false, true, false, true, false].map((isOut, i) => (
          <div
            key={i}
            style={{
              alignSelf: isOut ? "flex-end" : "flex-start",
              maxWidth: "62%",
            }}
          >
            {!isOut ? <SkeletonBlock width={72} height={10} style={{ marginBottom: 6 }} /> : null}
            <SkeletonBlock
              width={isOut ? 180 : 220}
              height={44}
              borderRadius={isOut ? "14px 14px 4px 14px" : "14px 14px 14px 4px"}
            />
          </div>
        ))}
      </div>
      <div style={{ padding: "12px 20px", background: "var(--bg-1)", borderTop: "1px solid var(--border-1)", position: "relative", zIndex: 1 }}>
        <SkeletonBlock height={42} borderRadius={22} />
      </div>
    </div>
  );
}

export function RightPanelSkeleton() {
  return (
    <div style={{ width: 300, flexShrink: 0, borderLeft: "1px solid var(--border-1)", background: "var(--bg-1)", padding: 16 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <SkeletonBlock height={32} style={{ flex: 1 }} />
        <SkeletonBlock height={32} style={{ flex: 1 }} />
        <SkeletonBlock height={32} style={{ flex: 1 }} />
      </div>
      <SkeletonBlock width={100} height={46} borderRadius={23} style={{ marginBottom: 12 }} />
      <SkeletonBlock width="70%" height={14} style={{ marginBottom: 8 }} />
      <SkeletonBlock width="50%" height={12} style={{ marginBottom: 16 }} />
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonBlock key={i} height={36} style={{ marginBottom: 8 }} />
      ))}
      <SkeletonBlock height={80} style={{ marginTop: 12 }} />
    </div>
  );
}

export function DashboardWorkspaceSkeleton() {
  return (
    <div style={{ display: "flex", height: "100%", width: "100%", background: "var(--bg-base)" }}>
      <div style={{ width: 72, flexShrink: 0, borderRight: "1px solid var(--border-1)", background: "var(--bg-1)", padding: 12, display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonBlock key={i} width={36} height={36} borderRadius={10} />
        ))}
      </div>
      <ChatListSkeleton />
      <ChatAreaSkeleton />
      <RightPanelSkeleton />
    </div>
  );
}

export function ConnectScreenSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6" style={{ background: "var(--bg-base)" }}>
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--surface-1)",
          border: "1px solid var(--border-1)",
          borderRadius: 16,
          padding: 28,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
          <SkeletonBlock width={56} height={56} borderRadius={14} />
          <SkeletonBlock width={160} height={18} style={{ marginTop: 16 }} />
          <SkeletonBlock width={240} height={12} style={{ marginTop: 10 }} />
        </div>
        <SkeletonBlock height={40} style={{ marginBottom: 12 }} />
        <SkeletonBlock height={220} borderRadius={12} style={{ marginBottom: 16 }} />
        <SkeletonBlock height={44} borderRadius={10} style={{ marginBottom: 10 }} />
        <SkeletonBlock height={40} borderRadius={10} />
      </div>
    </div>
  );
}

export function PageLoadingSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div style={{ width: 280 }}>
        <SkeletonBlock width="60%" height={16} style={{ margin: "0 auto 16px" }} />
        <SkeletonBlock height={8} borderRadius={99} />
      </div>
    </div>
  );
}

export function SettingsPageSkeleton() {
  return (
    <div style={{ flex: 1, padding: "28px 32px", background: "var(--bg-base)", overflowY: "auto" }}>
      <SkeletonBlock width={200} height={24} style={{ marginBottom: 24 }} />
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          style={{
            background: "var(--surface-1)",
            border: "1px solid var(--border-1)",
            borderRadius: "var(--radius-md)",
            padding: "20px 24px",
            marginBottom: 16,
          }}
        >
          <SkeletonBlock width="40%" height={16} style={{ marginBottom: 8 }} />
          <SkeletonBlock width="60%" height={12} style={{ marginBottom: 16 }} />
          <SkeletonBlock height={36} style={{ marginBottom: 10 }} />
          <SkeletonBlock height={36} style={{ marginBottom: 10 }} />
          <SkeletonBlock height={80} />
        </div>
      ))}
    </div>
  );
}

const PACKAGE_SKELETON_ACCENTS = [
  "linear-gradient(90deg, #64748b, #94a3b8)",
  "linear-gradient(90deg, #25d366, #128c7e)",
  "linear-gradient(90deg, #3b82f6, #6366f1)",
  "linear-gradient(90deg, #f59e0b, #ef4444)",
];

export function WebsitePackagesSkeleton() {
  return (
    <div className="website-packages-grid">
      {PACKAGE_SKELETON_ACCENTS.map((accent, i) => (
        <div
          key={i}
          style={{
            background: "var(--surface-1)",
            border: "1px solid var(--border-1)",
            borderRadius: 20,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            height: "100%",
          }}
        >
          <div style={{ height: 6, background: accent }} />
          <div style={{ padding: "24px 22px", flex: 1 }}>
            <SkeletonBlock width={90} height={10} style={{ marginBottom: 10 }} />
            <SkeletonBlock width="70%" height={20} style={{ marginBottom: 8 }} />
            <SkeletonBlock width="100%" height={12} style={{ marginBottom: 6 }} />
            <SkeletonBlock width="85%" height={12} style={{ marginBottom: 18 }} />
            <SkeletonBlock width={110} height={32} style={{ marginBottom: 20 }} />
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <SkeletonBlock width={14} height={14} borderRadius={4} />
                <SkeletonBlock width={`${75 + (j % 3) * 8}%`} height={11} />
              </div>
            ))}
            <SkeletonBlock height={40} borderRadius={10} style={{ marginTop: 8 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsPageSkeleton() {
  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            style={{
              background: "var(--surface-1)",
              border: "1px solid var(--border-1)",
              borderRadius: "var(--radius-md)",
              padding: "16px 18px",
            }}
          >
            <SkeletonBlock width="55%" height={10} style={{ marginBottom: 12 }} />
            <SkeletonBlock width="45%" height={28} style={{ marginBottom: 10 }} />
            <SkeletonBlock width="70%" height={11} />
          </div>
        ))}
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
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <SkeletonBlock width={160} height={14} style={{ marginBottom: 8 }} />
            <SkeletonBlock width={120} height={11} />
          </div>
          <SkeletonBlock width={100} height={34} borderRadius={99} />
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 100 }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <SkeletonBlock
              key={i}
              style={{ flex: 1, height: `${35 + (i % 4) * 15}%`, borderRadius: "4px 4px 0 0" }}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 16,
          marginBottom: 16,
        }}
      >
        {Array.from({ length: 2 }).map((_, panel) => (
          <div
            key={panel}
            style={{
              background: "var(--surface-1)",
              border: "1px solid var(--border-1)",
              borderRadius: "var(--radius-md)",
              padding: "16px 20px",
            }}
          >
            <SkeletonBlock width={panel === 0 ? 150 : 130} height={14} style={{ marginBottom: 16 }} />
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 0",
                  borderBottom: i < 4 ? "1px solid var(--border-1)" : "none",
                }}
              >
                <SkeletonBlock width={30} height={30} borderRadius={15} />
                <SkeletonBlock width="50%" height={12} style={{ flex: 1 }} />
                <SkeletonBlock width={48} height={10} />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--border-1)",
          borderRadius: "var(--radius-md)",
          padding: "20px 24px",
        }}
      >
        <SkeletonBlock width={180} height={14} style={{ marginBottom: 16 }} />
        <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 80 }}>
          {Array.from({ length: 24 }).map((_, i) => (
            <SkeletonBlock
              key={i}
              style={{ flex: 1, height: `${20 + (i % 5) * 12}%`, borderRadius: "2px 2px 0 0" }}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export function FollowUpsSelectedSkeleton() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
        gap: 16,
        paddingBottom: 8,
      }}
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          style={{
            background: "var(--surface-1)",
            border: "1px solid var(--border-1)",
            borderRadius: 16,
            padding: "18px 20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <SkeletonBlock width={44} height={44} borderRadius={22} />
            <div style={{ flex: 1 }}>
              <SkeletonBlock width="60%" height={14} style={{ marginBottom: 8 }} />
              <SkeletonBlock width="40%" height={11} />
            </div>
            <SkeletonBlock width={24} height={24} borderRadius={6} />
          </div>
          <SkeletonBlock width="50%" height={10} style={{ marginBottom: 10 }} />
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <SkeletonBlock width={88} height={32} borderRadius={99} />
            <SkeletonBlock width={100} height={32} borderRadius={99} />
            <SkeletonBlock width={72} height={32} borderRadius={99} />
          </div>
          <SkeletonBlock width="100%" height={11} />
        </div>
      ))}
    </div>
  );
}

export function FollowUpsAddSkeleton() {
  return (
    <>
      <div
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--border-1)",
          borderRadius: 14,
          padding: "16px 18px",
          marginBottom: 16,
        }}
      >
        <SkeletonBlock width={220} height={10} style={{ marginBottom: 12 }} />
        <div style={{ display: "flex", gap: 8 }}>
          <SkeletonBlock width={100} height={32} borderRadius={99} />
          <SkeletonBlock width={110} height={32} borderRadius={99} />
          <SkeletonBlock width={80} height={32} borderRadius={99} />
        </div>
      </div>
      <SkeletonBlock height={40} borderRadius={10} style={{ marginBottom: 12 }} />
      <div
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--border-1)",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "16px 20px",
              borderBottom: i < 7 ? "1px solid var(--border-1)" : "none",
            }}
          >
            <SkeletonBlock width={22} height={22} borderRadius={7} />
            <SkeletonBlock width={44} height={44} borderRadius={22} />
            <div style={{ flex: 1 }}>
              <SkeletonBlock width="45%" height={13} style={{ marginBottom: 8 }} />
              <SkeletonBlock width="30%" height={11} />
            </div>
            <SkeletonBlock width={40} height={11} />
          </div>
        ))}
      </div>
    </>
  );
}
