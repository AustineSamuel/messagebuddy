"use client";

import React from "react";

/* ── Avatar ── */
interface AvatarProps {
  initials: string;
  color?: string;
  size?: number;
  online?: boolean;
  className?: string;
}
export function Avatar({ initials, color = "#1e2d44", size = 40, online, className = "" }: AvatarProps) {
  return (
    <div className={`relative flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      <div
        className="flex items-center justify-center rounded-full font-semibold select-none"
        style={{
          width: size,
          height: size,
          background: color,
          fontSize: size * 0.32,
          color: "var(--text-0)",
        }}
      >
        {initials}
      </div>
      {online !== undefined && (
        <div
          className="absolute rounded-full border-2"
          style={{
            bottom: 1,
            right: 1,
            width: size * 0.26,
            height: size * 0.26,
            background: online ? "var(--wa-green)" : "var(--text-3)",
            borderColor: "var(--bg-1)",
          }}
        />
      )}
    </div>
  );
}

/* ── Badge ── */
interface BadgeProps {
  children: React.ReactNode;
  variant?: "green" | "red" | "blue" | "amber" | "purple" | "gray";
  className?: string;
}
export function Badge({ children, variant = "gray", className = "" }: BadgeProps) {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {children}
    </span>
  );
}

/* ── Toggle ── */
interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}
export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer select-none">
      {label && <span style={{ fontSize: 13, color: "var(--text-1)" }}>{label}</span>}
      <div
        className={`toggle-track ${checked ? "on" : ""}`}
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onChange(!checked)}
      >
        <div className="toggle-thumb" />
      </div>
    </label>
  );
}

/* ── Icon Button ── */
interface IconButtonProps {
  onClick?: () => void;
  title?: string;
  children: React.ReactNode;
  active?: boolean;
  size?: number;
}
export function IconButton({ onClick, title, children, active, size = 34 }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center justify-center rounded-lg border transition-all"
      style={{
        width: size,
        height: size,
        background: active ? "var(--wa-green-glow)" : "var(--bg-2)",
        borderColor: active ? "var(--wa-green)" : "var(--border-1)",
        color: active ? "var(--wa-green)" : "var(--text-1)",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

/* ── Section Label ── */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.8px",
        textTransform: "uppercase",
        color: "var(--text-2)",
        marginBottom: 8,
        marginTop: 16,
      }}
    >
      {children}
    </p>
  );
}

/* ── Form Input ── */
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}
export function FormInput({ label, className = "", onFocus, onBlur, ...props }: FormInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            color: "var(--text-2)",
          }}
        >
          {label}
        </label>
      )}
      <input
        className={className}
        style={{
          background: "var(--bg-2)",
          border: "1px solid var(--border-1)",
          borderRadius: "var(--radius-xs)",
          padding: "9px 12px",
          fontSize: 13,
          color: "var(--text-0)",
          outline: "none",
          width: "100%",
          fontFamily: "var(--font-sans)",
          transition: "border-color 0.15s",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "var(--wa-green)";
          onFocus?.(e);
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "var(--border-1)";
          onBlur?.(e);
        }}
        {...props}
      />
    </div>
  );
}

/* ── Form Textarea ── */
interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}
export function FormTextarea({ label, className = "", style, onFocus, onBlur, ...props }: FormTextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            color: "var(--text-2)",
          }}
        >
          {label}
        </label>
      )}
      <textarea
        className={className}
        style={{
          background: "var(--bg-2)",
          border: "1px solid var(--border-1)",
          borderRadius: "var(--radius-xs)",
          padding: "9px 12px",
          fontSize: 13,
          color: "var(--text-0)",
          outline: "none",
          width: "100%",
          fontFamily: "var(--font-sans)",
          resize: "vertical",
          minHeight: 80,
          lineHeight: 1.6,
          transition: "border-color 0.15s",
          ...style,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "var(--wa-green)";
          onFocus?.(e);
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "var(--border-1)";
          onBlur?.(e);
        }}
        {...props}
      />
    </div>
  );
}

/* ── Primary Button ── */
interface PrimaryBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "green" | "ghost" | "danger";
  size?: "sm" | "md";
}
export function PrimaryBtn({
  children,
  variant = "green",
  size = "md",
  style,
  ...props
}: PrimaryBtnProps) {
  const bg =
    variant === "green" ? "var(--wa-green)" : variant === "danger" ? "var(--red)" : "transparent";
  const border =
    variant === "green" ? "var(--wa-green)" : variant === "danger" ? "var(--red)" : "var(--border-2)";
  const color = variant === "ghost" ? "var(--text-1)" : "#fff";
  const padding = size === "sm" ? "6px 14px" : "9px 20px";
  return (
    <button
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: "var(--radius-xs)",
        padding,
        fontSize: 13,
        fontWeight: 600,
        color,
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        transition: "opacity 0.15s, transform 0.1s",
        ...style,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      {...props}
    >
      {children}
    </button>
  );
}

/* ── Dashed Add Button ── */
export function AddBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        width: "100%",
        padding: "8px 12px",
        background: "transparent",
        border: "1px dashed var(--border-2)",
        borderRadius: "var(--radius-xs)",
        cursor: "pointer",
        fontSize: 12,
        color: "var(--text-2)",
        fontFamily: "var(--font-sans)",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--wa-green)";
        e.currentTarget.style.color = "var(--wa-green)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border-2)";
        e.currentTarget.style.color = "var(--text-2)";
      }}
    >
      {children}
    </button>
  );
}
