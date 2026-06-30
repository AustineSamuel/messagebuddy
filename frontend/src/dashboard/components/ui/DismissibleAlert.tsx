"use client";

type Props = {
  message: string;
  onDismiss: () => void;
  variant?: "error" | "warning";
  className?: string;
};

export default function DismissibleAlert({
  message,
  onDismiss,
  variant = "error",
  className,
}: Props) {
  const isError = variant === "error";

  return (
    <div
      role="alert"
      className={className}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        background: isError ? "rgba(239,68,68,0.15)" : "rgba(251,191,36,0.12)",
        border: `1px solid ${isError ? "rgba(239,68,68,0.4)" : "rgba(251,191,36,0.35)"}`,
        color: isError ? "#fecaca" : "#fde68a",
        fontSize: 12,
        padding: "8px 12px",
        borderRadius: 10,
      }}
    >
      <span style={{ flex: 1, lineHeight: 1.45 }}>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        style={{
          flexShrink: 0,
          background: "transparent",
          border: "none",
          color: "inherit",
          cursor: "pointer",
          fontSize: 16,
          lineHeight: 1,
          padding: "0 2px",
          opacity: 0.85,
        }}
      >
        ×
      </button>
    </div>
  );
}
