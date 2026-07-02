"use client";

import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "@/app/lib/api";
import {
  getWebsitePackages,
  submitWebsiteOrder,
  type WebsiteOrderPaymentMethod,
  type WebsitePackage,
} from "@/app/services/website-services";
import { Badge } from "@/dashboard/components/ui/primitives";
import { WebsitePackagesSkeleton } from "@/dashboard/components/ui/WhatsAppSkeleton";

type Props = {
  businessName?: string;
  websiteUrl?: string;
};

type PackageTheme = {
  emoji: string;
  topBar: string;
  cardBg: string;
  cardBorder: string;
  glow: string;
  priceColor: string;
  checkColor: string;
  deliveryColor: string;
  iconBg: string;
  buttonBg: string;
  buttonShadow: string;
  popularBadge?: string;
};

const PACKAGE_THEMES: Record<string, PackageTheme> = {
  starter: {
    emoji: "🚀",
    topBar: "linear-gradient(90deg, #64748b 0%, #94a3b8 100%)",
    cardBg: "linear-gradient(160deg, rgba(100,116,139,0.08) 0%, var(--surface-1) 45%)",
    cardBorder: "rgba(148,163,184,0.35)",
    glow: "none",
    priceColor: "#94a3b8",
    checkColor: "#94a3b8",
    deliveryColor: "var(--text-2)",
    iconBg: "rgba(148,163,184,0.15)",
    buttonBg: "linear-gradient(135deg, #64748b, #475569)",
    buttonShadow: "0 8px 20px rgba(100,116,139,0.25)",
  },
  growth: {
    emoji: "📈",
    topBar: "linear-gradient(90deg, #25d366 0%, #128c7e 100%)",
    cardBg: "linear-gradient(160deg, rgba(37,211,102,0.12) 0%, var(--surface-1) 50%)",
    cardBorder: "var(--wa-green)",
    glow: "0 20px 48px rgba(37,211,102,0.18)",
    priceColor: "var(--wa-green)",
    checkColor: "var(--wa-green)",
    deliveryColor: "var(--wa-green)",
    iconBg: "var(--wa-green-glow)",
    buttonBg: "linear-gradient(135deg, #25d366, #128c7e)",
    buttonShadow: "0 10px 28px rgba(37,211,102,0.35)",
    popularBadge: "var(--wa-green)",
  },
  pro: {
    emoji: "🛒",
    topBar: "linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)",
    cardBg: "linear-gradient(160deg, rgba(59,130,246,0.1) 0%, rgba(99,102,241,0.06) 40%, var(--surface-1) 70%)",
    cardBorder: "rgba(99,102,241,0.45)",
    glow: "0 16px 40px rgba(59,130,246,0.14)",
    priceColor: "#6366f1",
    checkColor: "#3b82f6",
    deliveryColor: "#6366f1",
    iconBg: "rgba(99,102,241,0.15)",
    buttonBg: "linear-gradient(135deg, #3b82f6, #6366f1)",
    buttonShadow: "0 10px 28px rgba(99,102,241,0.3)",
  },
  enterprise: {
    emoji: "👑",
    topBar: "linear-gradient(90deg, #f59e0b 0%, #ef4444 55%, #a855f7 100%)",
    cardBg: "linear-gradient(160deg, rgba(245,158,11,0.1) 0%, rgba(239,68,68,0.06) 35%, var(--surface-1) 65%)",
    cardBorder: "rgba(245,158,11,0.5)",
    glow: "0 20px 50px rgba(245,158,11,0.15)",
    priceColor: "#f59e0b",
    checkColor: "#f59e0b",
    deliveryColor: "#f59e0b",
    iconBg: "rgba(245,158,11,0.15)",
    buttonBg: "linear-gradient(135deg, #f59e0b, #ef4444)",
    buttonShadow: "0 12px 32px rgba(245,158,11,0.35)",
  },
};

const FALLBACK_THEME = PACKAGE_THEMES.starter;

function themeForPackage(pkg: WebsitePackage): PackageTheme {
  return PACKAGE_THEMES[pkg.id] ?? FALLBACK_THEME;
}

type PackageCardProps = {
  pkg: WebsitePackage;
  onSelect: (pkg: WebsitePackage) => void;
};

function PackageCard({ pkg, onSelect }: PackageCardProps) {
  const theme = themeForPackage(pkg);

  return (
    <div
      style={{
        background: theme.cardBg,
        border: pkg.popular ? `2px solid ${theme.cardBorder}` : `1px solid ${theme.cardBorder}`,
        borderRadius: 20,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        boxShadow: theme.glow,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        minWidth: 0,
        height: "100%",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {pkg.popular ? (
        <div
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            background: theme.popularBadge ?? theme.priceColor,
            color: "#fff",
            fontSize: 10,
            fontWeight: 800,
            padding: "4px 10px",
            borderRadius: 99,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            zIndex: 1,
          }}
        >
          Most popular
        </div>
      ) : null}

      <div style={{ height: 6, background: theme.topBar }} />

      <div style={{ padding: "24px 22px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          {/* <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: theme.iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              flexShrink: 0,
            }}
          >
            {theme.emoji}
          </div> */}
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: theme.deliveryColor,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {pkg.deliveryDays}-day delivery
            </div>
            <h2 style={{ fontSize: 19, fontWeight: 800, color: "var(--text-0)", marginTop: 2 }}>
              {pkg.name}
            </h2>
          </div>
        </div>

        <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.55, marginBottom: 16, minHeight: 40 }}>
          {pkg.tagline}
        </p>

        <div style={{ fontSize: 32, fontWeight: 900, color: theme.priceColor, marginBottom: 18 }}>
          {pkg.priceLabel}
        </div>

        <ul style={{ margin: "0 0 22px", padding: 0, listStyle: "none", flex: 1 }}>
          {pkg.features.map((feature) => (
            <li
              key={feature}
              style={{
                fontSize: 13,
                color: "var(--text-1)",
                marginBottom: 10,
                paddingLeft: 22,
                position: "relative",
                lineHeight: 1.45,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  color: theme.checkColor,
                  fontWeight: 800,
                }}
              >
                ✓
              </span>
              {feature}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => onSelect(pkg)}
          style={{
            width: "100%",
            padding: "11px 20px",
            borderRadius: 10,
            border: "none",
            background: theme.buttonBg,
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            boxShadow: theme.buttonShadow,
            transition: "opacity 0.15s, transform 0.1s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.92";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = "scale(0.98)";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          Get started
        </button>
      </div>
    </div>
  );
}

export default function WebsiteServicesPage({ businessName = "", websiteUrl = "" }: Props) {
  const [packages, setPackages] = useState<WebsitePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPkg, setSelectedPkg] = useState<WebsitePackage | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    businessName: businessName,
    websiteUrl: websiteUrl,
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    notes: "",
    paymentMethod: "contact_me" as WebsiteOrderPaymentMethod,
  });

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      businessName: businessName || prev.businessName,
      websiteUrl: websiteUrl || prev.websiteUrl,
    }));
  }, [businessName, websiteUrl]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getWebsitePackages();
      setPackages(list);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const closeModal = () => {
    if (submitting) return;
    setSelectedPkg(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selectedPkg) return;
    if (!form.contactPhone.trim() && !form.contactEmail.trim()) {
      setError("Please enter your phone number or email so we can reach you.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const result = await submitWebsiteOrder({
        packageId: selectedPkg.id,
        businessName: form.businessName || null,
        websiteUrl: form.websiteUrl || null,
        contactName: form.contactName || null,
        contactPhone: form.contactPhone || null,
        contactEmail: form.contactEmail || null,
        notes: form.notes || null,
        paymentMethod: form.paymentMethod,
      });
      setSuccessMessage(result.message);
      setSelectedPkg(null);
      setTimeout(() => setSuccessMessage(null), 8000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTheme = selectedPkg ? themeForPackage(selectedPkg) : null;

  return (
    <div style={{ flex: 1, overflowY: "auto", background: "var(--bg-base)", paddingTop: 56 }}>
      <div
        style={{
          margin: "24px 40px",
          borderRadius: 24,
          padding: "40px 44px",
          background:
            "linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(37,211,102,0.12) 50%, rgba(139,92,246,0.15) 100%)",
          border: "1px solid rgba(59,130,246,0.25)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", zIndex: 1, maxWidth: 640 }}>
          <Badge variant="blue">Done-for-you websites</Badge>
          <h1
            style={{
              fontSize: 34,
              fontWeight: 900,
              color: "var(--text-0)",
              margin: "14px 0 10px",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            Your business deserves a website that sells while you sleep
          </h1>
          <p style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.65, marginBottom: 20 }}>
            Stop losing customers online. Landing pages where people shop your products (₦50k), admin
            analytics & click tracking (₦100k), and robust e-commerce with Google search visibility (₦500k).
          </p>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", fontSize: 13, color: "var(--text-1)" }}>
            {["No coding required", "Launch in days", "Built for business owners"].map((item) => (
              <span key={item} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "var(--wa-green)", fontWeight: 800 }}>✓</span> {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {successMessage ? (
        <div
          style={{
            margin: "0 40px 16px",
            padding: "14px 18px",
            borderRadius: 12,
            background: "var(--wa-green-glow)",
            border: "1px solid var(--wa-green)",
            color: "var(--wa-green)",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {successMessage}
        </div>
      ) : null}

      {error && !selectedPkg ? (
        <div
          style={{
            margin: "0 40px 16px",
            padding: 14,
            borderRadius: 12,
            background: "rgba(239,68,68,0.1)",
            color: "var(--red)",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      ) : null}

      <div style={{ padding: "8px 40px 48px", width: "100%", boxSizing: "border-box" }}>
        <style>{`
          .website-packages-grid {
            display: grid;
            gap: 20px;
            width: 100%;
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
          @media (max-width: 1100px) {
            .website-packages-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }
          @media (max-width: 560px) {
            .website-packages-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
        {loading ? (
          <WebsitePackagesSkeleton />
        ) : (
          <div className="website-packages-grid">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} onSelect={setSelectedPkg} />
            ))}
          </div>
        )}

        {!loading ? (
          <div
            style={{
              marginTop: 40,
              padding: "28px 32px",
              borderRadius: 16,
              background: "var(--surface-1)",
              border: "1px solid var(--border-1)",
              textAlign: "center",
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-0)", marginBottom: 8 }}>
              Not sure which plan fits?
            </h3>
            <p style={{ fontSize: 14, color: "var(--text-2)", maxWidth: 480, margin: "0 auto" }}>
              Pick any package and choose &quot;Contact me&quot; — we&apos;ll recommend the right setup for your
              business goals at no extra consultation fee.
            </p>
          </div>
        ) : null}
      </div>

      {selectedPkg && selectedTheme ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            padding: 24,
          }}
          onClick={closeModal}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 480,
              background: "var(--surface-1)",
              border: `1px solid ${selectedTheme.cardBorder}`,
              borderRadius: 20,
              padding: "28px 28px 24px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: selectedTheme.glow,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: selectedTheme.iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                }}
              >
                {selectedTheme.emoji}
              </span>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-0)", marginBottom: 2 }}>
                  {selectedPkg.name}
                </h2>
                <p style={{ fontSize: 14, color: selectedTheme.priceColor, fontWeight: 800 }}>
                  {selectedPkg.priceLabel} · {selectedPkg.deliveryDays}-day delivery
                </p>
              </div>
            </div>

            <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 18, lineHeight: 1.55 }}>
              How would you like to proceed? Pay now and we&apos;ll send transfer details, or contact me
              and our team will reach out within 24 hours.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {(
                [
                  { id: "pay_now", label: "Pay now", desc: "Get payment details" },
                  { id: "contact_me", label: "Contact me", desc: "We'll call you" },
                ] as const
              ).map((opt) => {
                const active = form.paymentMethod === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, paymentMethod: opt.id }))}
                    style={{
                      padding: "14px 12px",
                      borderRadius: 12,
                      border: active ? `2px solid ${selectedTheme.priceColor}` : "1px solid var(--border-2)",
                      background: active ? selectedTheme.iconBg : "var(--bg-2)",
                      cursor: "pointer",
                      textAlign: "left",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-0)" }}>{opt.label}</div>
                    <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 4 }}>{opt.desc}</div>
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 }}>
              <label style={labelStyle}>
                Business name
                <input
                  value={form.businessName}
                  onChange={(e) => setForm((p) => ({ ...p, businessName: e.target.value }))}
                  placeholder="Your business name"
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                Current website (if any)
                <input
                  value={form.websiteUrl}
                  onChange={(e) => setForm((p) => ({ ...p, websiteUrl: e.target.value }))}
                  placeholder="https://..."
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                Your name
                <input
                  value={form.contactName}
                  onChange={(e) => setForm((p) => ({ ...p, contactName: e.target.value }))}
                  placeholder="Full name"
                  style={inputStyle}
                />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <label style={labelStyle}>
                  Phone *
                  <input
                    value={form.contactPhone}
                    onChange={(e) => setForm((p) => ({ ...p, contactPhone: e.target.value }))}
                    placeholder="+234..."
                    style={inputStyle}
                  />
                </label>
                <label style={labelStyle}>
                  Email
                  <input
                    value={form.contactEmail}
                    onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))}
                    placeholder="you@email.com"
                    style={inputStyle}
                  />
                </label>
              </div>
              <label style={labelStyle}>
                Anything else we should know?
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  rows={2}
                  placeholder="Tell us about your business goals..."
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </label>
            </div>

            {error ? (
              <div style={{ marginBottom: 12, fontSize: 13, color: "var(--red)" }}>{error}</div>
            ) : null}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={closeModal}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: "1px solid var(--border-2)",
                  background: "transparent",
                  color: "var(--text-2)",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={submitting}
                style={{
                  flex: 2,
                  padding: "12px 20px",
                  borderRadius: 10,
                  border: "none",
                  background: selectedTheme.buttonBg,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: submitting ? "wait" : "pointer",
                  fontFamily: "var(--font-sans)",
                  opacity: submitting ? 0.75 : 1,
                  boxShadow: selectedTheme.buttonShadow,
                }}
              >
                {submitting
                  ? "Submitting…"
                  : form.paymentMethod === "pay_now"
                    ? `Request payment — ${selectedPkg.priceLabel}`
                    : `Contact me — ${selectedPkg.priceLabel}`}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "var(--text-2)",
  display: "block",
};

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 6,
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid var(--border-2)",
  background: "var(--bg-2)",
  color: "var(--text-0)",
  fontSize: 13,
  fontFamily: "var(--font-sans)",
};
