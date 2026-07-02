import { waDelete, waGet, waPatch, waPost } from "./client";
import type { WhatsAppMessage } from "./chats";

export async function searchMessages(
  query: string,
  options?: { page?: number; limit?: number; chatId?: string }
) {
  const params = new URLSearchParams({ query });
  if (options?.page) params.set("page", String(options.page));
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.chatId) params.set("chatId", options.chatId);
  return waGet<WhatsAppMessage[]>(`/messages/search?${params.toString()}`);
}

export async function getMessage(messageId: string) {
  return waGet<WhatsAppMessage>(`/messages/${encodeURIComponent(messageId)}`);
}

export async function sendMessage(
  chatId: string,
  content: string | Record<string, unknown>,
  options?: Record<string, unknown>
) {
  return waPost<WhatsAppMessage>("/messages", { chatId, content, options });
}

export async function reactToMessage(messageId: string, reaction: string) {
  return waPost<{
    messageId: string;
    reaction: string;
    reactions: Array<{ emoji: string; count: number; fromMe?: boolean }>;
  }>(`/messages/${encodeURIComponent(messageId)}/react`, { reaction });
}

export async function replyToMessage(
  messageId: string,
  content: string | Record<string, unknown>,
  options?: Record<string, unknown>
) {
  return waPost<WhatsAppMessage>(`/messages/${encodeURIComponent(messageId)}/reply`, {
    content,
    options,
  });
}

export async function forwardMessage(messageId: string, chatId: string) {
  return waPost(`/messages/${encodeURIComponent(messageId)}/forward`, { chatId });
}

export async function editMessage(
  messageId: string,
  content: string,
  options?: Record<string, unknown>
) {
  return waPatch<WhatsAppMessage>(`/messages/${encodeURIComponent(messageId)}`, {
    content,
    options,
  });
}

export async function deleteMessage(
  messageId: string,
  everyone = false,
  clearMedia = true
) {
  return waDelete(`/messages/${encodeURIComponent(messageId)}`, {
    everyone: String(everyone),
    clearMedia: String(clearMedia),
  });
}

export async function downloadMessageMedia(messageId: string) {
  return waGet<{
    mimetype: string;
    data: string;
    filename?: string;
    filesize?: number;
  }>(`/messages/${encodeURIComponent(messageId)}/media`);
}

export async function transcribeMessage(messageId: string) {
  return waPost<{ messageId: string; text: string }>(
    `/messages/${encodeURIComponent(messageId)}/transcribe`
  );
}

export async function getMessageReactions(messageId: string) {
  return waGet(`/messages/${encodeURIComponent(messageId)}/reactions`);
}

export async function getPollVotes(messageId: string) {
  return waGet(`/messages/${encodeURIComponent(messageId)}/poll-votes`);
}

export async function starMessage(messageId: string) {
  return waPost(`/messages/${encodeURIComponent(messageId)}/star`);
}

export async function unstarMessage(messageId: string) {
  return waPost(`/messages/${encodeURIComponent(messageId)}/unstar`);
}

export async function pinMessage(messageId: string, duration: number) {
  return waPost(`/messages/${encodeURIComponent(messageId)}/pin`, { duration });
}

export async function unpinMessage(messageId: string) {
  return waPost(`/messages/${encodeURIComponent(messageId)}/unpin`);
}

export async function voteInPoll(messageId: string, selectedOptions: string[]) {
  return waPost(`/messages/${encodeURIComponent(messageId)}/vote`, { selectedOptions });
}
