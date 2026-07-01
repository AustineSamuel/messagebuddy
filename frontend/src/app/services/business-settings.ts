import { apiFetch } from "@/app/lib/api";
import type { BusinessSettings, Product } from "@/dashboard/types";

export type BusinessSettingsResponse = BusinessSettings & {
  products: Product[];
};

export async function getBusinessSettings() {
  return apiFetch("/api/v1/business-settings") as Promise<BusinessSettingsResponse>;
}

export async function saveBusinessSettings(data: Partial<BusinessSettingsResponse>) {
  return apiFetch("/api/v1/business-settings", {
    method: "PUT",
    body: JSON.stringify(data),
  }) as Promise<BusinessSettingsResponse>;
}
