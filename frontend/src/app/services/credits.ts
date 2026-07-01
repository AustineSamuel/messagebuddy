import { apiFetch } from "@/app/lib/api";

export type CreditPackage = {
  credits: number;
  priceNgn: number;
  label: string;
};

export type CreditsAccount = {
  balance: number;
  signupGrant: number;
  creditsPerMessage: number;
  usedToday: number;
  messagesToday: number;
  purchaseRate: { credits: number; priceNgn: number };
  packages: CreditPackage[];
};

export type DailyCreditsUsage = {
  day: string;
  date: string;
  used: number;
  messages: number;
};

export async function getCreditsAccount() {
  return apiFetch("/api/v1/credits") as Promise<CreditsAccount>;
}

export async function getCreditsUsage(days = 7) {
  return apiFetch(`/api/v1/credits/usage?days=${days}`) as Promise<DailyCreditsUsage[]>;
}

export async function purchaseCredits(credits: number) {
  return apiFetch("/api/v1/credits/purchase", {
    method: "POST",
    body: JSON.stringify({ credits }),
  }) as Promise<{ balance: number; creditsAdded: number; priceNgn: number }>;
}
