"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { getErrorMessage } from "@/app/lib/api";
import {
  createProduct,
  deleteProduct,
  formatProductPrice,
  getProducts,
  updateProduct,
  type ProductInput,
} from "@/app/services/products";
import { Badge, PrimaryBtn } from "@/dashboard/components/ui/primitives";
import type { Product } from "@/dashboard/types";

const STOCK_OPTIONS: { value: Product["stock"]; label: string; variant: "green" | "amber" | "red" }[] = [
  { value: "in", label: "In stock", variant: "green" },
  { value: "low", label: "Low stock", variant: "amber" },
  { value: "out", label: "Out of stock", variant: "red" },
];

const EMPTY_FORM: ProductInput = {
  name: "",
  description: "",
  price: 0,
  currency: "NGN",
  emoji: "📦",
  stock: "in",
  images: [],
  totalSold: 0,
  active: true,
};

function stockBadge(stock: Product["stock"]) {
  const cfg = STOCK_OPTIONS.find((s) => s.value === stock) ?? STOCK_OPTIONS[0];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  accent?: string;
};

const StatCard = memo(function StatCard({ label, value, hint, accent }: StatCardProps) {
  return (
    <div
      style={{
        flex: "1 1 160px",
        background: "var(--surface-1)",
        border: "1px solid var(--border-1)",
        borderRadius: "var(--radius-md)",
        padding: "18px 20px",
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: accent ?? "var(--text-0)", marginTop: 6, lineHeight: 1.1 }}>
        {value}
      </div>
      {hint ? <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>{hint}</div> : null}
    </div>
  );
});

type ProductCardProps = {
  product: Product;
  selected: boolean;
  onSelect: () => void;
  onCopyLink: () => void;
};

const ProductCard = memo(function ProductCard({ product, selected, onSelect, onCopyLink }: ProductCardProps) {
  const cover = product.images?.[0];
  const priceLabel = formatProductPrice(product.price, product.currency);

  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        textAlign: "left",
        background: selected ? "var(--wa-green-glow)" : "var(--surface-1)",
        border: selected ? "1px solid var(--wa-green)" : "1px solid var(--border-1)",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        cursor: "pointer",
        padding: 0,
        fontFamily: "var(--font-sans)",
        transition: "border-color 0.15s, transform 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!selected) e.currentTarget.style.borderColor = "var(--border-2)";
      }}
      onMouseLeave={(e) => {
        if (!selected) e.currentTarget.style.borderColor = "var(--border-1)";
      }}
    >
      <div
        style={{
          height: 148,
          background: cover
            ? `center/cover no-repeat url(${cover})`
            : "linear-gradient(135deg, var(--bg-3), var(--bg-2))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: cover ? undefined : 42,
          position: "relative",
        }}
      >
        {!cover ? product.emoji ?? "📦" : null}
        {!product.active ? (
          <span
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              background: "rgba(0,0,0,0.65)",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              padding: "4px 8px",
              borderRadius: 99,
              textTransform: "uppercase",
            }}
          >
            Hidden
          </span>
        ) : null}
      </div>
      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-0)", marginBottom: 4, lineHeight: 1.3 }}>
              {product.name}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--wa-green)" }}>{priceLabel}</div>
          </div>
          {stockBadge(product.stock)}
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 12, fontSize: 11, color: "var(--text-2)" }}>
          <span>{product.totalSold.toLocaleString()} sold</span>
          <span>·</span>
          <span>{product.images.length} image{product.images.length === 1 ? "" : "s"}</span>
        </div>
        <div
          style={{ marginTop: 12, display: "flex", gap: 8 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onCopyLink}
            style={{
              flex: 1,
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid var(--border-2)",
              background: "var(--bg-2)",
              color: "var(--text-1)",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Copy checkout link
          </button>
        </div>
      </div>
    </button>
  );
});

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<ProductInput>(EMPTY_FORM);
  const [imageUrl, setImageUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getProducts();
      setProducts(list);
      setSelectedId((current) => {
        if (current && list.some((p) => p.id === current)) return current;
        return list[0]?.id ?? null;
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q)
    );
  }, [products, search]);

  const selected = products.find((p) => p.id === selectedId) ?? null;

  const stats = useMemo(() => {
    const totalSold = products.reduce((sum, p) => sum + p.totalSold, 0);
    const active = products.filter((p) => p.active).length;
    const lowStock = products.filter((p) => p.stock === "low" || p.stock === "out").length;
    return { total: products.length, totalSold, active, lowStock };
  }, [products]);

  const openCreate = () => {
    setIsCreating(true);
    setSelectedId(null);
    setForm(EMPTY_FORM);
    setImageUrl("");
  };

  const openEdit = (product: Product) => {
    setIsCreating(false);
    setSelectedId(product.id);
    setForm({
      name: product.name,
      description: product.description ?? "",
      price: product.price,
      currency: product.currency,
      emoji: product.emoji ?? "📦",
      stock: product.stock,
      images: product.images ?? [],
      totalSold: product.totalSold,
      active: product.active,
    });
    setImageUrl("");
  };

  const addImageUrl = () => {
    const url = imageUrl.trim();
    if (!url) return;
    setForm((prev) => ({ ...prev, images: [...(prev.images ?? []), url] }));
    setImageUrl("");
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: (prev.images ?? []).filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!form.name?.trim()) {
      setError("Product name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (isCreating) {
        const created = await createProduct(form);
        setProducts((prev) => [created, ...prev]);
        setSelectedId(created.id);
        setIsCreating(false);
      } else if (selectedId) {
        const updated = await updateProduct(selectedId, form);
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId || !window.confirm("Delete this product? This cannot be undone.")) return;
    setSaving(true);
    setError(null);
    try {
      await deleteProduct(selectedId);
      setProducts((prev) => prev.filter((p) => p.id !== selectedId));
      setSelectedId(null);
      setIsCreating(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const copyCheckoutLink = async (product: Product) => {
    try {
      await navigator.clipboard.writeText(product.checkoutUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy link.");
    }
  };

  const showEditor = isCreating || selectedId !== null;

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        overflow: "auto",
        padding: "28px 32px 40px",
        background: "var(--bg-base)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-0)", marginBottom: 6, letterSpacing: "-0.02em" }}>
              Product Store
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-2)", maxWidth: 520, lineHeight: 1.5 }}>
              Build your catalog with images, prices, and checkout links. When customers ask about a product on WhatsApp, AI finds it and sends them your checkout link.
            </p>
          </div>
          <PrimaryBtn variant="green" onClick={openCreate}>
            + New product
          </PrimaryBtn>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <StatCard label="Products" value={stats.total} hint="In your catalog" />
          <StatCard label="Total sold" value={stats.totalSold.toLocaleString()} hint="Checkout intents" accent="var(--wa-green)" />
          <StatCard label="Active" value={stats.active} hint="Visible to customers" />
          <StatCard label="Needs attention" value={stats.lowStock} hint="Low or out of stock" accent={stats.lowStock ? "var(--amber)" : undefined} />
        </div>

        {error ? (
          <div
            style={{
              marginBottom: 16,
              padding: "12px 14px",
              borderRadius: 10,
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.35)",
              color: "var(--red)",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        ) : null}

        {copied ? (
          <div style={{ marginBottom: 12, fontSize: 12, color: "var(--wa-green)", fontWeight: 600 }}>
            Checkout link copied to clipboard
          </div>
        ) : null}

        <div style={{ display: "grid", gridTemplateColumns: showEditor ? "1fr 380px" : "1fr", gap: 20, alignItems: "start" }}>
          <div>
            <div style={{ marginBottom: 14 }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                style={{
                  width: "100%",
                  maxWidth: 360,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid var(--border-2)",
                  background: "var(--bg-2)",
                  color: "var(--text-0)",
                  fontSize: 13,
                  fontFamily: "var(--font-sans)",
                }}
              />
            </div>

            {loading ? (
              <div style={{ color: "var(--text-2)", fontSize: 14, padding: 24 }}>Loading products…</div>
            ) : filtered.length === 0 ? (
              <div
                style={{
                  padding: 48,
                  textAlign: "center",
                  background: "var(--surface-1)",
                  border: "1px dashed var(--border-2)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>🛍️</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-0)", marginBottom: 6 }}>
                  {products.length === 0 ? "No products yet" : "No matches"}
                </div>
                <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 16 }}>
                  Add your first product so AI can recommend checkout links to customers.
                </p>
                {products.length === 0 ? (
                  <PrimaryBtn variant="green" onClick={openCreate}>
                    Create product
                  </PrimaryBtn>
                ) : null}
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                  gap: 14,
                }}
              >
                {filtered.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    selected={product.id === selectedId && !isCreating}
                    onSelect={() => openEdit(product)}
                    onCopyLink={() => void copyCheckoutLink(product)}
                  />
                ))}
              </div>
            )}
          </div>

          {showEditor ? (
            <div
              style={{
                position: "sticky",
                top: 16,
                background: "var(--surface-1)",
                border: "1px solid var(--border-1)",
                borderRadius: "var(--radius-md)",
                padding: "20px 22px",
              }}
            >
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-0)", marginBottom: 16 }}>
                {isCreating ? "New product" : "Edit product"}
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-2)" }}>
                  Name
                  <input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    style={fieldStyle}
                  />
                </label>

                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-2)" }}>
                  Description
                  <textarea
                    value={form.description ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    rows={3}
                    style={{ ...fieldStyle, resize: "vertical", minHeight: 72 }}
                  />
                </label>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-2)" }}>
                    Price (NGN)
                    <input
                      type="number"
                      min={0}
                      value={form.price}
                      onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                      style={fieldStyle}
                    />
                  </label>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-2)" }}>
                    Emoji
                    <input
                      value={form.emoji ?? ""}
                      onChange={(e) => setForm((p) => ({ ...p, emoji: e.target.value }))}
                      style={fieldStyle}
                      maxLength={4}
                    />
                  </label>
                </div>

                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-2)" }}>
                  Stock
                  <select
                    value={form.stock}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, stock: e.target.value as Product["stock"] }))
                    }
                    style={fieldStyle}
                  >
                    {STOCK_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-2)" }}>
                  Total sold
                  <input
                    type="number"
                    min={0}
                    value={form.totalSold ?? 0}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, totalSold: Number(e.target.value) || 0 }))
                    }
                    style={fieldStyle}
                  />
                </label>

                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-2)", marginBottom: 8 }}>
                    Images (paste URLs)
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://…"
                      style={{ ...fieldStyle, flex: 1 }}
                    />
                    <button type="button" onClick={addImageUrl} style={smallBtnStyle}>
                      Add
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                    {(form.images ?? []).map((url, i) => (
                      <div key={url + i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 6,
                            background: `center/cover url(${url})`,
                            flexShrink: 0,
                            border: "1px solid var(--border-1)",
                          }}
                        />
                        <span style={{ fontSize: 11, color: "var(--text-2)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {url}
                        </span>
                        <button type="button" onClick={() => removeImage(i)} style={smallBtnStyle}>
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text-1)" }}>
                  <input
                    type="checkbox"
                    checked={form.active ?? true}
                    onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                  />
                  Visible in store & AI catalog
                </label>

                {selected?.checkoutUrl ? (
                  <div
                    style={{
                      padding: 10,
                      borderRadius: 8,
                      background: "var(--bg-2)",
                      border: "1px solid var(--border-1)",
                      fontSize: 11,
                      color: "var(--text-2)",
                      wordBreak: "break-all",
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: 4, color: "var(--text-1)" }}>Checkout link</div>
                    {selected.checkoutUrl}
                  </div>
                ) : null}

                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <PrimaryBtn
                    variant="green"
                    onClick={() => void handleSave()}
                    style={{ flex: 1, opacity: saving ? 0.7 : 1 }}
                  >
                    {saving ? "Saving…" : isCreating ? "Create product" : "Save changes"}
                  </PrimaryBtn>
                  {!isCreating && selected ? (
                    <button
                      type="button"
                      onClick={() => void copyCheckoutLink(selected)}
                      style={smallBtnStyle}
                    >
                      Copy link
                    </button>
                  ) : null}
                </div>

                {!isCreating && selectedId ? (
                  <button
                    type="button"
                    onClick={() => void handleDelete()}
                    style={{
                      ...smallBtnStyle,
                      width: "100%",
                      color: "var(--red)",
                      borderColor: "rgba(239,68,68,0.35)",
                      marginTop: 4,
                    }}
                  >
                    Delete product
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const fieldStyle: React.CSSProperties = {
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

const smallBtnStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid var(--border-2)",
  background: "var(--bg-2)",
  color: "var(--text-1)",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "var(--font-sans)",
};
