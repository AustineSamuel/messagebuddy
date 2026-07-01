"use client";

import { useCallback, useState } from "react";
import { Badge, PrimaryBtn } from "@/dashboard/components/ui/primitives";
import { getErrorMessage } from "@/app/lib/api";
import { purchaseCredits, type CreditPackage } from "@/app/services/credits";

type Props = {
  balance: number;
  packages: CreditPackage[];
  creditsPerMessage: number;
  onPurchased: () => Promise<void>;
};

function formatNgn(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

const PACKAGE_ACCENTS = [
  "linear-gradient(135deg, #25d366 0%, #128c7e 100%)",
  "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
  "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
  "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
  "linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)",
];

export default function BuyCreditsPage({ balance, packages, creditsPerMessage, onPurchased }: Props) {
  const [selected, setSelected] = useState<number>(packages[1]?.credits ?? packages[0]?.credits ?? 100);
  const [purchasing, setPurchasing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPkg = packages.find((p) => p.credits === selected) ?? packages[0];
  const messagesEstimate = selectedPkg
    ? Math.floor(selectedPkg.credits / creditsPerMessage)
    : 0;

  const handlePurchase = useCallback(async () => {
    if (!selectedPkg) return;
    setPurchasing(true);
    setError(null);
    setSuccess(false);
    try {
      await purchaseCredits(selectedPkg.credits);
      await onPurchased();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPurchasing(false);
    }
  }, [onPurchased, selectedPkg]);

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        background: "var(--bg-base)",
        paddingTop: 56,
      }}
    >
      {/* Hero */}
      <div
        style={{
          margin: "24px 40px",
          borderRadius: 24,
          padding: "36px 40px",
          background: "linear-gradient(135deg, rgba(37,211,102,0.18) 0%, rgba(18,140,126,0.08) 50%, rgba(99,102,241,0.12) 100%)",
          border: "1px solid rgba(37,211,102,0.25)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(37,211,102,0.2) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <Badge variant="green">Credits</Badge>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-0)", margin: "12px 0 8px" }}>
            Power your AI assistant
          </h1>
          <p style={{ fontSize: 15, color: "var(--text-2)", maxWidth: 520, lineHeight: 1.6, marginBottom: 24 }}>
            Every WhatsApp message costs <strong style={{ color: "var(--wa-green)" }}>{creditsPerMessage}</strong> credits.
            Top up anytime — <strong>100 credits = ₦1,000</strong>.
          </p>
          <div
            style={{
              display: "inline-flex",
              alignItems: "baseline",
              gap: 10,
              background: "rgba(0,0,0,0.25)",
              backdropFilter: "blur(8px)",
              padding: "16px 24px",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span style={{ fontSize: 13, color: "var(--text-2)", fontWeight: 600 }}>Current balance</span>
            <span style={{ fontSize: 36, fontWeight: 800, color: "var(--wa-green)" }}>
              {balance.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </span>
            <span style={{ fontSize: 14, color: "var(--text-2)" }}>credits</span>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 40px 40px" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-0)", marginBottom: 16 }}>
          Choose a package
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 16,
            marginBottom: 28,
          }}
        >
          {packages.map((pkg, i) => {
            const isSelected = selected === pkg.credits;
            const accent = PACKAGE_ACCENTS[i % PACKAGE_ACCENTS.length];
            return (
              <button
                key={pkg.credits}
                type="button"
                onClick={() => setSelected(pkg.credits)}
                style={{
                  textAlign: "left",
                  padding: 0,
                  border: isSelected ? "2px solid var(--wa-green)" : "1px solid var(--border-1)",
                  borderRadius: 18,
                  background: "var(--surface-1)",
                  cursor: "pointer",
                  overflow: "hidden",
                  transform: isSelected ? "scale(1.02)" : "scale(1)",
                  transition: "transform 0.15s, border-color 0.15s, box-shadow 0.15s",
                  boxShadow: isSelected ? "0 8px 32px rgba(37,211,102,0.15)" : "none",
                }}
              >
                <div style={{ height: 6, background: accent }} />
                <div style={{ padding: "18px 20px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
                    {pkg.label}
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-0)", marginBottom: 4 }}>
                    {pkg.credits.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 12 }}>credits</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--wa-green)" }}>
                    {formatNgn(pkg.priceNgn)}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 6 }}>
                    ~{Math.floor(pkg.credits / creditsPerMessage).toLocaleString()} messages
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {error ? (
          <div
            style={{
              marginBottom: 16,
              padding: "12px 16px",
              borderRadius: 12,
              background: "var(--red-muted)",
              border: "1px solid var(--red)",
              color: "var(--red)",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        ) : null}

        {success ? (
          <div
            style={{
              marginBottom: 16,
              padding: "12px 16px",
              borderRadius: 12,
              background: "var(--wa-green-glow)",
              border: "1px solid var(--wa-green)",
              color: "var(--wa-green)",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Credits added successfully!
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            padding: "20px 24px",
            borderRadius: 16,
            background: "var(--bg-1)",
            border: "1px solid var(--border-1)",
          }}
        >
          <div>
            <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 4 }}>You&apos;ll receive</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-0)" }}>
              {selectedPkg?.credits.toLocaleString()} credits
            </div>
            <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>
              ≈ {messagesEstimate.toLocaleString()} messages at {creditsPerMessage} credits each
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 4 }}>Total</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "var(--wa-green)" }}>
              {selectedPkg ? formatNgn(selectedPkg.priceNgn) : "—"}
            </div>
            <PrimaryBtn
              variant="green"
              onClick={() => void handlePurchase()}
              style={{ marginTop: 12, minWidth: 160, opacity: purchasing ? 0.7 : 1 }}
            >
              {purchasing ? "Processing…" : success ? "Done ✓" : "Buy credits"}
            </PrimaryBtn>
          </div>
        </div>

        <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 16, textAlign: "center", lineHeight: 1.5 }}>
          MVP checkout — credits are added instantly. Payment gateway (Paystack / Flutterwave) integration coming soon.
        </p>
      </div>
    </div>
  );
}
