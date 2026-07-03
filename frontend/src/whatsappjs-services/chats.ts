import { waDelete, waGet, waPost, waPut } from "./client";
import type {
  ContactSummaryResponse,
  SyncContactSummaryInput,
} from "./contact-summary-types";

export type {
  ContactSummaryResponse,
  SpliterMessage,
  SyncContactSummaryInput,
} from "./contact-summary-types";

export type WhatsAppChat = Record<string, unknown>;
export type WhatsAppMessage = Record<string, unknown>;

export async function getChats() {
  return waGet<WhatsAppChat[]>("/chats");
}

export async function getChat(chatId: string) {
  return waGet<WhatsAppChat>(`/chats/${encodeURIComponent(chatId)}`);
}

export async function archiveChat(chatId: string) {
  return waPost(`/chats/${encodeURIComponent(chatId)}/archive`);
}

export async function unarchiveChat(chatId: string) {
  return waPost(`/chats/${encodeURIComponent(chatId)}/unarchive`);
}

export async function muteChat(chatId: string, unmuteDate?: number) {
  return waPost(`/chats/${encodeURIComponent(chatId)}/mute`, { unmuteDate });
}

export async function unmuteChat(chatId: string) {
  return waPost(`/chats/${encodeURIComponent(chatId)}/unmute`);
}

export async function pinChat(chatId: string) {
  return waPost(`/chats/${encodeURIComponent(chatId)}/pin`);
}

export async function unpinChat(chatId: string) {
  return waPost(`/chats/${encodeURIComponent(chatId)}/unpin`);
}

export async function markChatUnread(chatId: string) {
  return waPost(`/chats/${encodeURIComponent(chatId)}/mark-unread`);
}

export async function clearChatMessages(chatId: string) {
  return waPost(`/chats/${encodeURIComponent(chatId)}/clear-messages`);
}

export async function deleteChat(chatId: string) {
  return waDelete(`/chats/${encodeURIComponent(chatId)}`);
}

export async function fetchChatMessages(
  chatId: string,
  options?: { limit?: number; fromMe?: boolean }
) {
  const params = new URLSearchParams();
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.fromMe !== undefined) params.set("fromMe", String(options.fromMe));
  const qs = params.toString();
  return waGet<WhatsAppMessage[]>(
    `/chats/${encodeURIComponent(chatId)}/messages${qs ? `?${qs}` : ""}`
  );
}

export async function getPinnedMessages(chatId: string) {
  return waGet<WhatsAppMessage[]>(`/chats/${encodeURIComponent(chatId)}/pinned-messages`);
}

export async function sendChatMessage(
  chatId: string,
  content: string | Record<string, unknown>,
  options?: Record<string, unknown>
) {
  return waPost<WhatsAppMessage>(`/chats/${encodeURIComponent(chatId)}/messages`, {
    content,
    options,
  });
}

export async function sendSeen(chatId: string) {
  return waPost(`/chats/${encodeURIComponent(chatId)}/seen`);
}

export async function sendTyping(chatId: string) {
  return waPost(`/chats/${encodeURIComponent(chatId)}/typing`);
}

export async function sendRecording(chatId: string) {
  return waPost(`/chats/${encodeURIComponent(chatId)}/recording`);
}

export async function syncHistory(chatId: string) {
  return waPost(`/chats/${encodeURIComponent(chatId)}/sync-history`);
}

export async function getChatLabels(chatId: string) {
  return waGet(`/chats/${encodeURIComponent(chatId)}/labels`);
}

export async function setChatLabels(chatId: string, labelIds: string[]) {
  return waPut(`/chats/${encodeURIComponent(chatId)}/labels`, { labelIds });
}

export async function getCustomerNote(chatId: string) {
  return waGet<{ note: unknown }>(`/chats/${encodeURIComponent(chatId)}/customer-note`);
}

export async function setCustomerNote(chatId: string, note: string) {
  return waPut(`/chats/${encodeURIComponent(chatId)}/customer-note`, { note });
}

export async function getContactSummary(chatId: string) {
  return waGet<ContactSummaryResponse>(
    `/chats/${encodeURIComponent(chatId)}/contact-summary`
  );
}

export async function listContactSummaries() {
  return waGet<ContactSummaryResponse[]>("/contact-summaries");
}

export async function refreshContactSummary(
  chatId: string,
  options?: SyncContactSummaryInput
) {
  const params = new URLSearchParams();
  if (options?.force) params.set("force", "true");
  const qs = params.toString();
  const { force: _force, ...body } = options ?? {};
  return waPost<ContactSummaryResponse>(
    `/chats/${encodeURIComponent(chatId)}/contact-summary/refresh${qs ? `?${qs}` : ""}`,
    body
  );
}

export type AiSuggestReplyResponse = {
  suggestion: string;
  messageCount: number;
};

export async function suggestAiReply(chatId: string, options?: { limit?: number }) {
  const params = new URLSearchParams();
  if (options?.limit) params.set("limit", String(options.limit));
  const qs = params.toString();
  return waPost<AiSuggestReplyResponse>(
    `/chats/${encodeURIComponent(chatId)}/ai-suggest-reply${qs ? `?${qs}` : ""}`
  );
}
