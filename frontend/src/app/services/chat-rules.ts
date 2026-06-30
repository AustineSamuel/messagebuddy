import { apiFetch } from "@/app/lib/api";
import type { ContactRule } from "@/dashboard/types";

export const DEFAULT_CHAT_RULE_ID = "__default__";

export type ChatRuleSettings = {
  chatId: string;
  rule: ContactRule;
  notes: string | null;
  aiAutoReply: boolean;
  sendCatalog: boolean;
  notifyOnReply: boolean;
  customInstructions: string | null;
};

export type ChatRulesIndex = {
  default: ChatRuleSettings;
  rules: Record<string, ChatRuleSettings>;
};

export type ChatRuleResponse = {
  chatId: string;
  settings: ChatRuleSettings;
  default: ChatRuleSettings;
  isUsingDefault: boolean;
};

export async function getAllChatRules() {
  return apiFetch("/api/v1/chat-rules") as Promise<ChatRulesIndex>;
}

export async function getDefaultChatRules() {
  return apiFetch("/api/v1/chat-rules/default") as Promise<ChatRuleSettings>;
}

export async function saveDefaultChatRules(
  data: Partial<Omit<ChatRuleSettings, "chatId">>
) {
  return apiFetch("/api/v1/chat-rules/default", {
    method: "PUT",
    body: JSON.stringify(data),
  }) as Promise<ChatRuleSettings>;
}

export async function getChatRules(chatId: string) {
  return apiFetch(
    `/api/v1/chat-rules/${encodeURIComponent(chatId)}`
  ) as Promise<ChatRuleResponse>;
}

export async function saveChatRules(
  chatId: string,
  data: Partial<Omit<ChatRuleSettings, "chatId">>
) {
  return apiFetch(`/api/v1/chat-rules/${encodeURIComponent(chatId)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }) as Promise<ChatRuleSettings>;
}
