"use client";

import { useEffect, useState } from "react";
import {
  formatProductPrice,
  getStorefront,
  recordCheckoutIntent,
} from "@/app/services/products";
import type { Product } from "@/dashboard/types";

type Props = {
  userId: string;
  slug: string;
};

export default function ShopProductPage({ userId, slug }: Props) {
  const [product, setProduct] = useState<Product | null>(null);
  const [sellerName, setSellerName] = useState("");
  const [sellerWebsite, setSellerWebsite] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ordering, setOrdering] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getStorefront(Number(userId), slug);
        if (cancelled) return;
        setProduct(data.product);
        setSellerName(data.seller.name || "Store");
        setSellerWebsite(data.seller.website);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Product not found.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, slug]);

  const handleCheckout = async () => {
    setOrdering(true);
    try {
      const result = await recordCheckoutIntent(Number(userId), slug);
      setProduct(result.product);
      setOrdered(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={shellStyle}>
          <div style={{ padding: "80px 24px", textAlign: "center", color: "#94a3b8" }}>
            Loading product details…
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={pageStyle}>
        <div style={{ ...shellStyle, maxWidth: 480, textAlign: "center", padding: "64px 32px" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f8fafc", marginBottom: 8 }}>
            Product not found
          </h1>
          <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.6 }}>
            {error ?? "This link may be invalid or the product is no longer available."}
          </p>
          <p style={{ color: "#64748b", fontSize: 13, marginTop: 20 }}>
            You can close this tab and return to your WhatsApp chat.
          </p>
        </div>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [];
  const cover = images[activeImage];
  const priceLabel = formatProductPrice(product.price, product.currency);
  const outOfStock = product.stock === "out";

  const buyBox = (
    <div style={buyBoxStyle}>
      {ordered ? (
        <div style={successBoxStyle}>
          <strong style={{ display: "block", marginBottom: 6 }}>Order interest recorded</strong>
          The seller will follow up on WhatsApp. You can close this tab and return to your chat.
        </div>
      ) : null}

      <button
        type="button"
        disabled={outOfStock || ordering}
        onClick={() => void handleCheckout()}
        style={{
          width: "100%",
          padding: "16px 24px",
          borderRadius: 14,
          border: "none",
          background: outOfStock ? "#334155" : "linear-gradient(135deg, #25d366, #128c7e)",
          color: "#fff",
          fontSize: 16,
          fontWeight: 800,
          cursor: outOfStock ? "not-allowed" : "pointer",
          opacity: ordering ? 0.85 : 1,
          boxShadow: outOfStock ? "none" : "0 12px 32px rgba(37,211,102,0.28)",
        }}
      >
        {outOfStock ? "Out of stock" : ordering ? "Processing…" : "Complete checkout"}
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 14 }}>
        {["Secure link", "No login needed", "WhatsApp follow-up"].map((label) => (
          <div key={label} style={trustPillStyle}>
            {label}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        {/* Top bar — return to chat hint */}
        <header style={headerStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={logoMarkStyle}>W</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#25d366", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                MessageBuddy Store
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>{sellerName}</div>
            </div>
          </div>
          <div style={returnHintStyle}>
            Opened from WhatsApp — return to your chat anytime
          </div>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1.05fr 0.95fr",
            gap: isMobile ? 24 : 40,
            padding: isMobile ? "20px 16px 120px" : "28px 32px 40px",
          }}
        >
          {/* Gallery */}
          <div>
            <div
              style={{
                aspectRatio: "1",
                borderRadius: 20,
                overflow: "hidden",
                background: cover
                  ? `center/cover no-repeat url(${cover})`
                  : "linear-gradient(145deg, #1e293b, #0f172a)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 80,
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 24px 48px rgba(0,0,0,0.35)",
              }}
            >
              {!cover ? product.emoji ?? "📦" : null}
            </div>
            {images.length > 1 ? (
              <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                {images.map((url, i) => (
                  <button
                    key={url + i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    aria-label={`View image ${i + 1}`}
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 12,
                      border:
                        activeImage === i
                          ? "2px solid #25d366"
                          : "1px solid rgba(255,255,255,0.12)",
                      background: `center/cover url(${url})`,
                      cursor: "pointer",
                      padding: 0,
                    }}
                  />
                ))}
              </div>
            ) : null}
          </div>

          {/* Product info */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#25d366", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
              {sellerName}
            </div>
            <h1
              style={{
                fontSize: isMobile ? 28 : 34,
                fontWeight: 900,
                color: "#f8fafc",
                lineHeight: 1.12,
                marginBottom: 12,
                letterSpacing: "-0.02em",
              }}
            >
              {product.name}
            </h1>

            <div style={{ fontSize: 30, fontWeight: 900, color: "#25d366", marginBottom: 16 }}>
              {priceLabel}
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 22, flexWrap: "wrap" }}>
              <span style={pillStyle(product.stock === "in" ? "#22c55e" : product.stock === "low" ? "#f59e0b" : "#ef4444")}>
                {product.stock === "in" ? "In stock" : product.stock === "low" ? "Low stock" : "Out of stock"}
              </span>
              <span style={pillStyle("#64748b")}>{product.totalSold.toLocaleString()} sold</span>
              <span style={pillStyle("#3b82f6")}>Free to view</span>
            </div>

            {!isMobile ? buyBox : null}

            {product.description ? (
              <section style={{ marginTop: 28 }}>
                <h2 style={sectionTitleStyle}>Product details</h2>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: "#cbd5e1", whiteSpace: "pre-wrap", margin: 0 }}>
                  {product.description}
                </p>
              </section>
            ) : null}

            <section style={{ marginTop: 28 }}>
              <h2 style={sectionTitleStyle}>Why shop here</h2>
              <ul style={{ margin: 0, paddingLeft: 18, color: "#94a3b8", fontSize: 14, lineHeight: 1.8 }}>
                <li>Instant product details — no account required</li>
                <li>One-tap checkout records your interest with the seller</li>
                <li>Continue the conversation on WhatsApp after viewing</li>
              </ul>
            </section>

            {sellerWebsite ? (
              <a
                href={sellerWebsite.startsWith("http") ? sellerWebsite : `https://${sellerWebsite}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: 20,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#25d366",
                  textDecoration: "none",
                }}
              >
                Visit {sellerName} website →
              </a>
            ) : null}
          </div>
        </div>
      </div>

      {/* Sticky mobile checkout bar */}
      {isMobile ? (
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            padding: "12px 16px calc(12px + env(safe-area-inset-bottom))",
            background: "rgba(11,18,32,0.92)",
            backdropFilter: "blur(12px)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            zIndex: 50,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>{product.name}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#25d366" }}>{priceLabel}</div>
            </div>
            <button
              type="button"
              disabled={outOfStock || ordering}
              onClick={() => void handleCheckout()}
              style={{
                padding: "14px 20px",
                borderRadius: 12,
                border: "none",
                background: outOfStock ? "#334155" : "linear-gradient(135deg, #25d366, #128c7e)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 800,
                cursor: outOfStock ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {outOfStock ? "Sold out" : ordered ? "Done ✓" : "Checkout"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "radial-gradient(ellipse at top, #1e293b 0%, #0b1220 60%)",
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  padding: "24px 16px",
};

const shellStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 1080,
  margin: "0 auto",
  background: "rgba(15,23,42,0.72)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 24,
  overflow: "hidden",
  boxShadow: "0 32px 64px rgba(0,0,0,0.4)",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
  padding: "16px 24px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(0,0,0,0.2)",
};

const logoMarkStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 10,
  background: "linear-gradient(135deg, #25d366, #128c7e)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 900,
  color: "#fff",
  fontSize: 15,
};

const returnHintStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#94a3b8",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 99,
  padding: "8px 14px",
};

const buyBoxStyle: React.CSSProperties = {
  padding: 20,
  borderRadius: 16,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const successBoxStyle: React.CSSProperties = {
  padding: 14,
  borderRadius: 12,
  background: "rgba(37,211,102,0.12)",
  border: "1px solid rgba(37,211,102,0.35)",
  color: "#86efac",
  fontSize: 13,
  lineHeight: 1.55,
  marginBottom: 14,
};

const trustPillStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  textAlign: "center",
  color: "#94a3b8",
  padding: "8px 6px",
  borderRadius: 8,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 800,
  color: "#e2e8f0",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: 10,
};

function pillStyle(color: string): React.CSSProperties {
  return {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: 99,
    fontSize: 12,
    fontWeight: 700,
    background: `${color}22`,
    color,
    border: `1px solid ${color}44`,
  };
}
