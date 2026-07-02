import { apiFetch } from "@/app/lib/api";

export type WebsitePackage = {
  id: string;
  name: string;
  tagline: string;
  amountNgn: number;
  priceLabel: string;
  popular?: boolean;
  deliveryDays: number;
  features: string[];
};

export type WebsiteOrderPaymentMethod = "pay_now" | "contact_me";

export type WebsiteOrderInput = {
  packageId: string;
  businessName?: string | null;
  websiteUrl?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  notes?: string | null;
  paymentMethod: WebsiteOrderPaymentMethod;
};

export type WebsiteOrder = {
  id: number;
  userId: number;
  packageId: string;
  packageName: string;
  amountNgn: number;
  amountLabel: string;
  businessName: string | null;
  websiteUrl: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  notes: string | null;
  paymentMethod: WebsiteOrderPaymentMethod;
  status: string;
  createdAt: string;
  updatedAt: string | null;
};

export async function getWebsitePackages() {
  return apiFetch("/api/v1/website-services/packages") as Promise<WebsitePackage[]>;
}

export async function getMyWebsiteOrders() {
  return apiFetch("/api/v1/website-services/orders") as Promise<WebsiteOrder[]>;
}

export async function submitWebsiteOrder(data: WebsiteOrderInput) {
  return apiFetch("/api/v1/website-services/orders", {
    method: "POST",
    body: JSON.stringify(data),
  }) as Promise<{ order: WebsiteOrder; message: string }>;
}
