import type { Contact, ContactRule, Message } from "@/dashboard/types";

const AVATAR_COLORS = [
  "#1e3a4a",
  "#1a2e50",
  "#2e1a50",
  "#1a3a3a",
  "#3a1a28",
  "#2a3a1a",
  "#1a2a3a",
];

export type ApiChat = {
  id: string;
  name?: string | null;
  isGroup?: boolean;
  unreadCount?: number;
  timestamp?: number;
  lastMessage?: {
    body?: string;
    fromMe?: boolean;
    timestamp?: number;
  } | null;
};

export type ApiMessage = {
  id: string;
  body?: string;
  fromMe?: boolean;
  timestamp?: number;
  type?: string;
};

export type ApiWaContact = {
  id: string;
  name?: string | null;
  pushname?: string | null;
  number?: string | null;
  isMe?: boolean;
  isGroup?: boolean;
};

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function avatarColorForId(id: string) {
  return AVATAR_COLORS[hashString(id) % AVATAR_COLORS.length]!;
}

export function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function formatRelativeTime(timestamp?: number) {
  if (!timestamp) return "";
  const diffSec = Math.floor(Date.now() / 1000 - timestamp);
  if (diffSec < 60) return "now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h`;
  return `${Math.floor(diffSec / 86400)}d`;
}

export function formatMessageTime(timestamp?: number) {
  if (!timestamp) return "";
  return new Date(timestamp * 1000).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function chatToContact(chat: ApiChat, rule: ContactRule = "default"): Contact {
  const name = chat.name?.trim() || chat.id.split("@")[0] || "Unknown";
  return {
    id: chat.id,
    name,
    phone: chat.id.replace(/@.+$/, ""),
    initials: initialsFromName(name),
    avatarColor: avatarColorForId(chat.id),
    online: false,
    rule,
    unreadCount: chat.unreadCount ?? 0,
    lastMessage: chat.lastMessage?.body ?? "",
    lastMessageTime: formatRelativeTime(chat.timestamp),
    aiHandled: false,
    isGroup: chat.isGroup ?? false,
  };
}

export function waContactToContact(contact: ApiWaContact, rule: ContactRule = "default"): Contact {
  const name =
    contact.name?.trim() ||
    contact.pushname?.trim() ||
    contact.number ||
    contact.id.split("@")[0] ||
    "Unknown";
  return {
    id: contact.id,
    name,
    phone: contact.number || contact.id.replace(/@.+$/, ""),
    initials: initialsFromName(name),
    avatarColor: avatarColorForId(contact.id),
    online: false,
    rule,
    unreadCount: 0,
    lastMessage: "",
    lastMessageTime: "",
    aiHandled: false,
    isGroup: contact.isGroup ?? false,
  };
}

export function apiMessageToMessage(message: ApiMessage): Message {
  return {
    id: message.id,
    direction: message.fromMe ? "out" : "in",
    text: message.body ?? `[${message.type ?? "message"}]`,
    time: formatMessageTime(message.timestamp),
    aiGenerated: false,
  };
}

const RULES_STORAGE_KEY = "messagebuddy-contact-rules";

export function readContactRules(): Record<string, ContactRule> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(RULES_STORAGE_KEY) || "{}") as Record<
      string,
      ContactRule
    >;
  } catch {
    return {};
  }
}

export function writeContactRule(chatId: string, rule: ContactRule) {
  const rules = readContactRules();
  rules[chatId] = rule;
  window.localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(rules));
}

export function getStoredContactRule(chatId: string): ContactRule {
  return readContactRules()[chatId] ?? "default";
}
