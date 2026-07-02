import { apiFetch } from "@/app/lib/api";
import type { Product } from "@/dashboard/types";

export type ProductInput = {
  name: string;
  description?: string | null;
  price: number | string;
  currency?: string;
  emoji?: string | null;
  stock?: "in" | "low" | "out";
  images?: string[];
  totalSold?: number;
  active?: boolean;
};

export type StorefrontResponse = {
  product: Product;
  seller: {
    name: string;
    website: string | null;
  };
};

export async function getProducts() {
  return apiFetch("/api/v1/products") as Promise<Product[]>;
}

export async function createProduct(data: ProductInput) {
  return apiFetch("/api/v1/products", {
    method: "POST",
    body: JSON.stringify(data),
  }) as Promise<Product>;
}

export async function updateProduct(id: number, data: Partial<ProductInput>) {
  return apiFetch(`/api/v1/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }) as Promise<Product>;
}

export async function deleteProduct(id: number) {
  return apiFetch(`/api/v1/products/${id}`, {
    method: "DELETE",
  }) as Promise<{ deleted: boolean }>;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3333";

export async function getStorefront(userId: number, slug: string) {
  const res = await fetch(`${API_BASE}/api/v1/store/${userId}/products/${slug}`, {
    credentials: "omit",
    headers: { Accept: "application/json" },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      body?.message || body?.error || "Product not found.";
    throw new Error(message);
  }
  return (body?.data ?? body) as StorefrontResponse;
}

export async function recordCheckoutIntent(userId: number, slug: string) {
  const res = await fetch(
    `${API_BASE}/api/v1/store/${userId}/products/${slug}/checkout`,
    {
      method: "POST",
      credentials: "omit",
      headers: { Accept: "application/json" },
    }
  );
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message = body?.message || body?.error || "Checkout failed.";
    throw new Error(message);
  }
  return (body?.data ?? body) as { ok: boolean; product: Product };
}

export function formatProductPrice(price: string, currency = "NGN") {
  const amount = Number(price);
  if (currency === "NGN") return `₦${amount.toLocaleString("en-NG")}`;
  return `${currency} ${amount.toLocaleString()}`;
}
