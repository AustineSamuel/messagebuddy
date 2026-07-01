import { apiFetch } from "@/app/lib/api";

export type AnalyticsPeriod = "today" | "7d" | "30d";

export type AnalyticsSummary = {
  period: AnalyticsPeriod;
  balance: number;
  signupGrant: number;
  creditsPerMessage: number;
  messagesSent: number;
  creditsUsed: number;
  activeChats: number;
  aiMessages: number;
  messagesTrendPct: number;
};

export type TopContact = {
  chatId: string;
  chatLabel: string;
  messages: number;
};

export type RecentMessage = {
  id: number;
  chatId: string;
  chatLabel: string;
  preview: string;
  source: string;
  isAi: boolean;
  creditsCharged: number;
  createdAt: string;
};

export async function getAnalyticsSummary(period: AnalyticsPeriod = "7d") {
  return apiFetch(`/api/v1/analytics/summary?period=${period}`) as Promise<AnalyticsSummary>;
}

export async function getHourlyVolume() {
  return apiFetch("/api/v1/analytics/hourly") as Promise<{ hours: number[] }>;
}

export async function getTopContacts(period: AnalyticsPeriod = "7d", limit = 5) {
  return apiFetch(
    `/api/v1/analytics/top-contacts?period=${period}&limit=${limit}`
  ) as Promise<TopContact[]>;
}

export async function getRecentMessages(limit = 8) {
  return apiFetch(`/api/v1/analytics/recent-messages?limit=${limit}`) as Promise<RecentMessage[]>;
}
