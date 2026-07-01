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

export interface Message {
  id: string;
  direction: "in" | "out";
  text: string;
  time: string;
  aiGenerated: boolean;
  edited?: boolean;
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
  emoji: string;
  name: string;
  price: string;
  stock: "in" | "low" | "out";
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
}

export interface TriggerRule {
  id: number;
  keyword: string;
  action: string;
}

export type NavView = "chats" | "dashboard" | "contacts" | "followups" | "credits" | "settings";
export type RightTab = "info" | "ai" | "credits";
