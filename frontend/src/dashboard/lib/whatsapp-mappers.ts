import { isAudioApiMessage } from "@/dashboard/lib/audio-messages";
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
  phone?: string | null;
  profilePicUrl?: string | null;
  isGroup?: boolean;
  unreadCount?: number;
  timestamp?: number;
  lastMessage?: {
    body?: string;
    fromMe?: boolean;
    timestamp?: number;
    type?: string;
    hasMedia?: boolean;
  } | null;
};

export type ApiMessage = {
  id: string;
  body?: string;
  fromMe?: boolean;
  timestamp?: number;
  type?: string;
  author?: string | null;
  from?: string;
  to?: string;
  hasMedia?: boolean;
  ack?: number;
};

export type ContactLookup = Map<string, { name: string; phone: string }>;

function formatPhoneDisplay(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return value;
  if (digits.length >= 10 && !value.startsWith("+")) {
    return `+${digits}`;
  }
  return value.startsWith("+") ? value : digits;
}

function idLocalPart(id: string) {
  return id.split("@")[0]?.trim() ?? id;
}

export function buildContactLookup(contacts: Contact[]): ContactLookup {
  const map: ContactLookup = new Map();
  for (const c of contacts) {
    const entry = { name: c.name, phone: c.phone };
    map.set(c.id, entry);
    const local = idLocalPart(c.id);
    if (local) {
      map.set(local, entry);
      map.set(`${local}@c.us`, entry);
      map.set(`${local}@lid`, entry);
    }
    if (c.phone) {
      const phoneDigits = c.phone.replace(/\D/g, "");
      if (phoneDigits) {
        map.set(phoneDigits, entry);
        map.set(`${phoneDigits}@c.us`, entry);
      }
    }
  }
  return map;
}

export function resolveSenderLabel(
  senderId: string | null | undefined,
  lookup: ContactLookup
): string | null {
  if (!senderId) return null;

  const direct = lookup.get(senderId);
  if (direct?.name?.trim() && direct.name !== "Unknown") return direct.name.trim();
  if (direct?.phone) return formatPhoneDisplay(direct.phone);

  const local = idLocalPart(senderId);
  const byLocal = lookup.get(local);
  if (byLocal?.name?.trim() && byLocal.name !== "Unknown") return byLocal.name.trim();
  if (byLocal?.phone) return formatPhoneDisplay(byLocal.phone);

  const digits = local.replace(/\D/g, "");
  if (digits.length >= 6) return formatPhoneDisplay(digits);
  if (local) return local;

  return null;
}

export type MessageMapContext = {
  lookup: ContactLookup;
  chatContact?: Contact;
  isGroup?: boolean;
};

export function apiMessageToMessage(message: ApiMessage, ctx?: MessageMapContext): Message {
  const isAudio = isAudioApiMessage(message);
  const text = isAudio
    ? message.body?.trim() || ""
    : message.body?.trim() ||
      (message.type ? `[${message.type}]` : "Message");

  const isOut = Boolean(message.fromMe);
  const senderId = isOut
    ? null
    : message.author || message.from || ctx?.chatContact?.id || null;

  let senderLabel: string | null = null;
  if (isOut) {
    senderLabel = ctx?.isGroup ? "You" : null;
  } else {
    senderLabel =
      resolveSenderLabel(senderId, ctx?.lookup ?? new Map()) ||
      ctx?.chatContact?.name ||
      resolveSenderLabel(ctx?.chatContact?.id, ctx?.lookup ?? new Map()) ||
      (senderId ? formatPhoneDisplay(idLocalPart(senderId)) : null) ||
      "Contact";
  }

  return {
    id: message.id,
    direction: isOut ? "out" : "in",
    text,
    time: formatMessageTime(message.timestamp),
    timestamp: message.timestamp,
    aiGenerated: false,
    messageType: message.type,
    isAudio,
    hasMedia: message.hasMedia,
    senderLabel,
    senderColor: senderId ? avatarColorForId(senderId) : undefined,
    senderId,
  };
}

/** Whether to show the sender header above this message (group-style clustering). */
export function shouldShowSenderHeader(
  message: Message,
  previous: Message | undefined,
  isGroup: boolean
) {
  if (!message.senderLabel) return false;

  if (isGroup) {
    if (message.direction === "out") {
      return !previous || previous.direction !== "out";
    }
    return (
      !previous ||
      previous.direction !== message.direction ||
      previous.senderId !== message.senderId ||
      previous.senderLabel !== message.senderLabel
    );
  }

  if (message.direction === "out") return false;
  return !previous || previous.direction === "out";
}

export type ApiWaContact = {
  id: string;
  name?: string | null;
  pushname?: string | null;
  number?: string | null;
  profilePicUrl?: string | null;
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

function displayNameFromChat(chat: ApiChat) {
  const fromTitle = chat.name?.trim()
  if (fromTitle) return fromTitle

  const local = chat.id.split("@")[0]?.trim()
  if (local && /\d{6,}/.test(local)) return local.replace(/\D/g, "")
  if (local) return local

  return "Unknown"
}

export function chatToContact(chat: ApiChat, rule: ContactRule = "default"): Contact {
  const name = displayNameFromChat(chat)
  const lastBody =
    chat.lastMessage?.body?.trim() || (chat.lastMessage && isAudioApiMessage(chat.lastMessage)
      ? "🎤 Voice message"
      : chat.lastMessage?.hasMedia
        ? `[${chat.lastMessage.type || "media"}]`
        : "") ||
    (chat.lastMessage?.type ? `[${chat.lastMessage.type}]` : "")
  return {
    id: chat.id,
    name,
    phone: chat.phone?.trim() || chat.id.replace(/@.+$/, ""),
    avatarUrl: chat.profilePicUrl || undefined,
    initials: initialsFromName(name),
    avatarColor: avatarColorForId(chat.id),
    online: false,
    rule,
    unreadCount: chat.unreadCount ?? 0,
    lastMessage: lastBody,
    lastMessageTime: formatRelativeTime(chat.lastMessage?.timestamp ?? chat.timestamp),
    aiHandled: false,
    isGroup: chat.isGroup ?? false,
  }
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
    avatarUrl: contact.profilePicUrl || undefined,
    online: false,
    rule,
    unreadCount: 0,
    lastMessage: "",
    lastMessageTime: "",
    aiHandled: false,
    isGroup: contact.isGroup ?? false,
  };
}
