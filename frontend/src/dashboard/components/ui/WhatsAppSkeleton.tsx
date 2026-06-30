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
