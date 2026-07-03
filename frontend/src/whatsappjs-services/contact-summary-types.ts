export type SpliterMessage = {
  message: string;
  sender: "customer" | "business";
  sentAt: string;
  reaction: string | null;
};

export type SyncContactSummaryInput = {
  spliter: SpliterMessage[];
  contactLabel?: string;
  isGroup?: boolean;
  force?: boolean;
};

export type ContactSummaryResponse = {
  chatId: string;
  summaryText: string | null;
  messageCount: number;
  latestMessageAt: number | null;
  updatedAt: string | null;
  refreshing?: boolean;
  skipped?: boolean;
  reason?: string;
};
