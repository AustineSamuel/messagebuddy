import { apiFetch } from "@/app/lib/api";

export type FollowUpInterval = "daily" | "weekly" | "every_3_days";

export type FollowUpSchedule = {
  id: number;
  chatId: string;
  interval: FollowUpInterval;
  enabled: boolean;
  lastSentAt: string | null;
  nextRunAt: string | null;
};

export async function getFollowUpSchedules() {
  return apiFetch("/api/v1/follow-ups") as Promise<FollowUpSchedule[]>;
}

export type FollowUpContactInput = {
  chatId: string;
  interval: FollowUpInterval;
};

export async function syncFollowUpSchedules(data: {
  interval?: FollowUpInterval;
  chatIds?: string[];
  contacts?: FollowUpContactInput[];
  enabled?: boolean;
}) {
  return apiFetch("/api/v1/follow-ups/sync", {
    method: "PUT",
    body: JSON.stringify(data),
  }) as Promise<FollowUpSchedule[]>;
}

export async function updateFollowUp(
  chatId: string,
  data: { enabled?: boolean; interval?: FollowUpInterval }
) {
  return apiFetch(`/api/v1/follow-ups/${encodeURIComponent(chatId)}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  }) as Promise<FollowUpSchedule>;
}

export async function toggleFollowUp(chatId: string, enabled: boolean) {
  return updateFollowUp(chatId, { enabled });
}

export const FOLLOW_UP_INTERVAL_LABELS: Record<FollowUpInterval, string> = {
  daily: "Daily",
  every_3_days: "Every 3 days",
  weekly: "Weekly",
};

export const FOLLOW_UP_INTERVAL_DESCRIPTIONS: Record<FollowUpInterval, string> = {
  daily: "AI checks in once per day",
  every_3_days: "AI follows up every 3 days",
  weekly: "AI sends a weekly check-in",
};
