export type ContactRule = "always" | "never" | "custom" | "default";

export interface Contact {
  id: string;
  name: string;
  phone: string;
  initials: string;
  avatarColor: string;
  online: boolean;
  rule: ContactRule;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  aiHandled: boolean;
  isGroup?: boolean;
  tags?: string[];
  notes?: string;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  fromMe?: boolean;
}

export interface QuotedMessage {
  id: string;
  text: string;
  fromMe: boolean;
  isAudio?: boolean;
}

export interface Message {
  id: string;
  direction: "in" | "out";
  text: string;
  time: string;
  /** Unix seconds — used when syncing contact summaries to the backend */
  timestamp?: number;
  aiGenerated: boolean;
  edited?: boolean;
  /** WhatsApp message type e.g. chat, ptt, audio, image */
  messageType?: string;
  /** True for voice notes and audio attachments */
  isAudio?: boolean;
  hasMedia?: boolean;
  hasQuotedMsg?: boolean;
  quotedMessage?: QuotedMessage | null;
  reactions?: MessageReaction[];
  /** Display name or phone for the sender */
  senderLabel?: string | null;
  /** Accent color for group sender names */
  senderColor?: string;
  senderId?: string | null;
}

export interface Conversation {
  contactId: string;
  messages: Message[];
}

export interface DailyCredits {
  day: string;
  date: string;
  used: number;
  messages: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  currency: string;
  emoji: string | null;
  stock: "in" | "low" | "out";
  images: string[];
  totalSold: number;
  active: boolean;
  checkoutUrl: string;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface BusinessSettings {
  name: string;
  description: string;
  website: string;
  address: string;
  aiRules: string;
  responseLanguage: string;
  escalationRules: string;
  tone: "professional" | "casual" | "formal" | "energetic";
  slug: string | null;
  phone: string | null;
  logoUrl: string | null;
  tagline: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  accentColor: string;
  publicStoreEnabled: boolean;
  storeUrl: string | null;
}

export interface TriggerRule {
  id: number;
  keyword: string;
  action: string;
}

export type NavView = "chats" | "dashboard" | "contacts" | "followups" | "credits" | "settings" | "products" | "website";
export type RightTab = "info" | "ai" | "credits";
