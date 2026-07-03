import { getApiBase } from "@/app/lib/api-base";
import type { Product } from "@/dashboard/types";

const API_BASE = getApiBase();

export type PublicBusinessProfile = {
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  logoUrl: string | null;
  accentColor: string;
  seoTitle: string | null;
  seoDescription: string | null;
  storeUrl: string;
};

export type PublicStorefront = {
  business: PublicBusinessProfile;
  products: Product[];
};

export type PublicProductPage = {
  business: PublicBusinessProfile;
  product: Product;
};

export const RESERVED_BUSINESS_SLUGS = new Set([
  "login",
  "register",
  "dashboard",
  "shop",
  "api",
  "admin",
  "settings",
  "products",
  "store",
  "manifest",
  "sw",
  "icon",
  "favicon",
  "_next",
]);

function unwrap<T>(body: unknown): T {
  if (body && typeof body === "object" && "data" in body) {
    return (body as { data: T }).data;
  }
  return body as T;
}

async function publicFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const useRevalidate =
    init &&
    "next" in init &&
    init.next &&
    typeof init.next === "object" &&
    "revalidate" in init.next;

  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      Accept: "application/json",
      ...(init?.headers || {}),
    },
    ...init,
    cache: useRevalidate ? undefined : (init?.cache ?? "no-store"),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      (body as { message?: string })?.message ||
      (body as { error?: string })?.error ||
      "Not found.";
    throw new Error(message);
  }
  return unwrap<T>(body);
}

export async function getBusinessStorefront(
  businessSlug: string,
  options?: { revalidate?: number }
) {
  const cache =
    options?.revalidate !== undefined
      ? ({ next: { revalidate: options.revalidate } } as RequestInit)
      : undefined;

  return publicFetch<PublicStorefront>(
    `/api/v1/store/business/${encodeURIComponent(businessSlug)}`,
    cache
  );
}

export async function getBusinessProduct(
  businessSlug: string,
  productSlug: string,
  options?: { revalidate?: number }
) {
  const cache =
    options?.revalidate !== undefined
      ? ({ next: { revalidate: options.revalidate } } as RequestInit)
      : undefined;

  return publicFetch<PublicProductPage>(
    `/api/v1/store/business/${encodeURIComponent(businessSlug)}/products/${encodeURIComponent(productSlug)}`,
    cache
  );
}

export async function recordBusinessCheckout(
  businessSlug: string,
  productSlug: string
) {
  return publicFetch<{ ok: boolean; product: Product }>(
    `/api/v1/store/business/${encodeURIComponent(businessSlug)}/products/${encodeURIComponent(productSlug)}/checkout`,
    { method: "POST" }
  );
}

export function formatStorePrice(price: string, currency = "NGN") {
  const amount = Number(price);
  if (Number.isNaN(amount)) return price;
  if (currency === "NGN") return `₦${amount.toLocaleString("en-NG")}`;
  return `${currency} ${amount.toLocaleString()}`;
}

export function whatsAppUrl(phone: string | null | undefined, message?: string) {
  if (!phone?.trim()) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}

export function telUrl(phone: string | null | undefined) {
  if (!phone?.trim()) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  return `tel:+${digits}`;
}

export function externalWebsiteUrl(website: string | null | undefined) {
  if (!website?.trim()) return null;
  return website.startsWith("http") ? website : `https://${website}`;
}
