"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "@/app/lib/api";
import {
  getBusinessSettings,
  saveBusinessSettings,
} from "@/app/services/business-settings";
import {
  getAllChatRules,
  getChatRules,
  saveChatRules,
  saveDefaultChatRules,
  type ChatRuleSettings,
  type ChatRulesIndex,
} from "@/app/services/chat-rules";
import type { BusinessSettings, ContactRule, TriggerRule, Conversation, Contact, NavView, RightTab, MessageReaction } from "@/dashboard/types";
import {
  getCreditsAccount,
  getCreditsUsage,
  type CreditPackage,
  type DailyCreditsUsage,
} from "@/app/services/credits";
import { DEMO_TRIGGER_RULES } from "@/dashboard/data/demo";

const EMPTY_BUSINESS_SETTINGS: BusinessSettings = {
  name: "",
  description: "",
  website: "",
  address: "",
  aiRules: "",
  responseLanguage: "auto",
  escalationRules: "",
  tone: "professional",
  slug: null,
  phone: null,
  logoUrl: null,
  tagline: null,
  seoTitle: null,
  seoDescription: null,
  accentColor: "#25D366",
  publicStoreEnabled: true,
  storeUrl: null,
};
import {
  apiMessageToMessage,
  buildContactLookup,
  chatToContact,
  formatRelativeTime,
  waContactToContact,
  type ApiChat,
  type ApiMessage,
  type ApiWaContact,
} from "@/dashboard/lib/whatsapp-mappers";
import { dedupeContactsById } from "@/dashboard/lib/contacts";
import { isAudioApiMessage } from "@/dashboard/lib/audio-messages";
import {
  apiMessagesToSpliter,
  dashboardMessagesToSpliter,
  type SpliterMessage,
} from "@/dashboard/lib/spliter-messages";
import {
  useWhatsAppRealtime,
  type RealtimeEvent,
  type RealtimeMessageEvent,
  type RealtimeReactionEvent,
} from "@/dashboard/hooks/useWhatsAppRealtime";
import {
  fetchChatMessages,
  getChats,
  getContactSummary,
  listContactSummaries,
  refreshContactSummary,
  sendChatMessage,
  sendSeen,
} from "@/whatsappjs-services/chats";
import type { ContactSummaryResponse } from "@/whatsappjs-services/contact-summary-types";
import {
  editMessage as editWhatsAppMessage,
  reactToMessage as reactWhatsAppMessage,
  replyToMessage as replyWhatsAppMessage,
} from "@/whatsappjs-services/messages";
import { getContacts } from "@/whatsappjs-services/contacts";
import { getClientInfo } from "@/whatsappjs-services/session";
import { setDisplayName, setStatus } from "@/whatsappjs-services/profile";

type Props = {
  whatsAppReady: boolean;
};

function ruleForChat(chatId: string, index: ChatRulesIndex | null): ContactRule {
  if (!index) return "default";
  return index.rules[chatId]?.rule ?? index.default.rule;
}

function contactNotes(contactId: string, index: ChatRulesIndex | null): string | undefined {
  if (!index) return undefined;
  if (Object.prototype.hasOwnProperty.call(index.rules, contactId)) {
    return index.rules[contactId].notes ?? undefined;
  }
  return index.default.notes ?? undefined;
}

function applyRulesToContacts(list: Contact[], index: ChatRulesIndex | null) {
  return list.map((c) => ({
    ...c,
    rule: ruleForChat(c.id, index),
    notes: contactNotes(c.id, index) ?? c.notes,
  }));
}

function keepDefaultChatSettings(
  prev: ChatRuleSettings | null,
  next: ChatRuleSettings
): ChatRuleSettings {
  if (prev && JSON.stringify(prev) === JSON.stringify(next)) return prev;
  return next;
}

function lastMessagePreview(message: ApiMessage) {
  if (message.body?.trim()) return message.body.trim();
  if (isAudioApiMessage(message)) return "🎤 Voice message";
  if (message.hasMedia) return `[${message.type || "media"}]`;
  if (message.type) return `[${message.type}]`;
  return "";
}

function spliterFingerprint(spliter: SpliterMessage[]) {
  const last = spliter[spliter.length - 1];
  return `${spliter.length}:${last?.sentAt ?? ""}:${last?.message?.slice(0, 40) ?? ""}`;
}

export function useDashboardStore({ whatsAppReady }: Props) {
  const [activeView, setActiveView] = useState<NavView>("chats");
  const [activeContactId, setActiveContactId] = useState<string>("");
  const [activeRightTab, setActiveRightTab] = useState<RightTab>("info");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [waContacts, setWaContacts] = useState<Contact[]>([]);
  const [conversations, setConversations] = useState<Record<string, Conversation>>({});
  const [settings, setSettings] = useState<BusinessSettings>(EMPTY_BUSINESS_SETTINGS);
  const [triggerRules, setTriggerRules] = useState<TriggerRule[]>(DEMO_TRIGGER_RULES);
  const [creditsBalance, setCreditsBalance] = useState(0);
  const [creditsUsedToday, setCreditsUsedToday] = useState(0);
  const [signupGrant, setSignupGrant] = useState(5000);
  const [creditsPerMessage, setCreditsPerMessage] = useState(0.5);
  const [dailyCreditsUsage, setDailyCreditsUsage] = useState<DailyCreditsUsage[]>([]);
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([]);
  const [loadingCredits, setLoadingCredits] = useState(true);
  const [chatRulesIndex, setChatRulesIndex] = useState<ChatRulesIndex | null>(null);
  const [activeChatSettings, setActiveChatSettings] = useState<ChatRuleSettings | null>(null);
  const [activeChatUsingDefault, setActiveChatUsingDefault] = useState(true);
  const [defaultChatSettings, setDefaultChatSettings] = useState<ChatRuleSettings | null>(null);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingRules, setLoadingRules] = useState(true);
  const [loadingBusinessSettings, setLoadingBusinessSettings] = useState(true);
  const [loadingChatSettings, setLoadingChatSettings] = useState(false);
  const [savingChatSettings, setSavingChatSettings] = useState(false);
  const [savingDefaultSettings, setSavingDefaultSettings] = useState(false);
  const [savingBusinessSettings, setSavingBusinessSettings] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [contactSummaries, setContactSummaries] = useState<
    Record<string, ContactSummaryResponse>
  >({});
  const [loadingAllSummaries, setLoadingAllSummaries] = useState(false);
  const [editingMessage, setEditingMessage] = useState<{
    contactId: string;
    messageId: string;
    text: string;
  } | null>(null);
  const rulesIndexRef = useRef<ChatRulesIndex | null>(null);
  const loadedChatsRef = useRef(new Set<string>());
  const chatSettingsLoadGenRef = useRef(new Map<string, number>());
  const messageSoundRef = useRef<HTMLAudioElement | null>(null);
  const activeContactIdRef = useRef(activeContactId);
  const contactsRef = useRef(contacts);
  const waContactsRef = useRef(waContacts);
  const conversationsRef = useRef(conversations);
  const summarySyncTimersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const summarySyncFingerprintRef = useRef(new Map<string, string>());
  const contactSummariesRef = useRef(contactSummaries);
  const summaryFetchInflightRef = useRef(new Set<string>());

  activeContactIdRef.current = activeContactId;
  contactsRef.current = contacts;
  waContactsRef.current = waContacts;
  conversationsRef.current = conversations;
  contactSummariesRef.current = contactSummaries;

  useEffect(() => {
    messageSoundRef.current = new Audio("/sound.wav");
    messageSoundRef.current.preload = "auto";
  }, []);

  function bumpChatSettingsGeneration(chatId: string) {
    const next = (chatSettingsLoadGenRef.current.get(chatId) ?? 0) + 1;
    chatSettingsLoadGenRef.current.set(chatId, next);
    return next;
  }

  function playIncomingMessageSound() {
    const audio = messageSoundRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play().catch(() => undefined);
  }

  const cacheContactSummary = useCallback((data: ContactSummaryResponse) => {
    setContactSummaries((prev) => {
      const existing = prev[data.chatId];
      const summaryText = data.summaryText?.trim() || existing?.summaryText?.trim() || null;
      if (!summaryText) return prev;
      return {
        ...prev,
        [data.chatId]: {
          ...data,
          summaryText,
          refreshing: undefined,
        },
      };
    });
  }, []);

  const fetchContactSummary = useCallback(async (chatId: string, force = false) => {
    if (!chatId) return null;

    const cached = contactSummariesRef.current[chatId];
    if (!force && cached?.summaryText?.trim()) {
      return cached;
    }

    if (summaryFetchInflightRef.current.has(chatId)) {
      return contactSummariesRef.current[chatId] ?? null;
    }

    summaryFetchInflightRef.current.add(chatId);
    try {
      const data = await getContactSummary(chatId);
      const summaryText = data.summaryText?.trim() || cached?.summaryText?.trim() || null;
      if (summaryText) {
        const merged: ContactSummaryResponse = {
          ...data,
          summaryText,
          refreshing: undefined,
        };
        setContactSummaries((prev) => ({ ...prev, [chatId]: merged }));
        return merged;
      }
      return cached ?? null;
    } catch {
      return contactSummariesRef.current[chatId] ?? null;
    } finally {
      summaryFetchInflightRef.current.delete(chatId);
    }
  }, []);

  const loadAllContactSummaries = useCallback(async () => {
    setLoadingAllSummaries(true);
    try {
      const list = await listContactSummaries();
      setContactSummaries((prev) => {
        const next = { ...prev };
        for (const item of list) {
          if (!item.summaryText?.trim()) continue;
          next[item.chatId] = { ...item, refreshing: undefined };
        }
        return next;
      });
      return list;
    } catch {
      return [];
    } finally {
      setLoadingAllSummaries(false);
    }
  }, []);

  const pushContactSummary = useCallback(async (chatId: string, spliter: SpliterMessage[]) => {
    if (!spliter.length) return;

    const contact =
      contactsRef.current.find((c) => c.id === chatId) ??
      waContactsRef.current.find((c) => c.id === chatId);

    if (contact?.isGroup) return;

    const fingerprint = spliterFingerprint(spliter);
    if (summarySyncFingerprintRef.current.get(chatId) === fingerprint) return;

    try {
      const data = await refreshContactSummary(chatId, {
        spliter,
        contactLabel: contact?.name,
        isGroup: contact?.isGroup,
      });
      cacheContactSummary(data);
      summarySyncFingerprintRef.current.set(chatId, fingerprint);
    } catch {
      // Non-critical — do not block chat UI or session polling.
    }
  }, [cacheContactSummary]);

  const scheduleContactSummarySync = useCallback(
    (chatId: string, spliter: SpliterMessage[], delayMs = 3000) => {
      if (!spliter.length) return;

      const timers = summarySyncTimersRef.current;
      const existing = timers.get(chatId);
      if (existing) clearTimeout(existing);

      timers.set(
        chatId,
        setTimeout(() => {
          timers.delete(chatId);
          void pushContactSummary(chatId, spliter);
        }, delayMs)
      );
    },
    [pushContactSummary]
  );

  const activeContact =
    contacts.find((c) => c.id === activeContactId) ?? contacts[0];
  const activeConversation = activeContactId
    ? conversations[activeContactId]
    : undefined;

  const loadCredits = useCallback(async () => {
    setLoadingCredits(true);
    try {
      const [account, usage] = await Promise.all([getCreditsAccount(), getCreditsUsage(7)]);
      setCreditsBalance(account.balance);
      setCreditsUsedToday(account.usedToday);
      setSignupGrant(account.signupGrant);
      setCreditsPerMessage(account.creditsPerMessage);
      setDailyCreditsUsage(usage);
      setCreditPackages(account.packages);
    } catch (err) {
      setSyncError(getErrorMessage(err));
    } finally {
      setLoadingCredits(false);
    }
  }, []);

  const refreshCredits = loadCredits;

  const loadBusinessSettings = useCallback(async () => {
    setLoadingBusinessSettings(true);
    try {
      const data = await getBusinessSettings();
      const { products: _legacyProducts, ...businessFields } = data;
      setSettings(businessFields);
    } catch (err) {
      setSyncError(getErrorMessage(err));
    } finally {
      setLoadingBusinessSettings(false);
    }
  }, []);

  const loadAllChatRules = useCallback(async () => {
    setLoadingRules(true);
    try {
      const index = await getAllChatRules();
      rulesIndexRef.current = index;
      setChatRulesIndex(index);
      setDefaultChatSettings((prev) => keepDefaultChatSettings(prev, index.default));
      setContacts((prev) => applyRulesToContacts(prev, index));
      setWaContacts((prev) => applyRulesToContacts(prev, index));
    } catch (err) {
      setSyncError(getErrorMessage(err));
    } finally {
      setLoadingRules(false);
    }
  }, []);

  const loadChatSettings = useCallback(async (chatId: string) => {
    if (!chatId) return;
    const generation = bumpChatSettingsGeneration(chatId);
    setLoadingChatSettings(true);
    try {
      const response = await getChatRules(chatId);
      if (chatSettingsLoadGenRef.current.get(chatId) !== generation) return;

      setActiveChatSettings(response.settings);
      setActiveChatUsingDefault(response.isUsingDefault);
      setContacts((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? {
                ...c,
                rule: response.isUsingDefault
                  ? response.default.rule
                  : response.settings.rule,
                notes: response.isUsingDefault
                  ? undefined
                  : response.settings.notes ?? undefined,
              }
            : c
        )
      );
    } catch (err) {
      if (chatSettingsLoadGenRef.current.get(chatId) !== generation) return;
      setSyncError(getErrorMessage(err));
    } finally {
      if (chatSettingsLoadGenRef.current.get(chatId) === generation) {
        setLoadingChatSettings(false);
      }
    }
  }, []);

  const loadChats = useCallback(async () => {
    setLoadingChats(true);
    setSyncError(null);
    try {
      const chats = (await getChats()) as ApiChat[];
      const index = rulesIndexRef.current;
      const mapped = chats
        .filter((c) => !c.id.includes("@broadcast"))
        .map((chat) => chatToContact(chat, ruleForChat(chat.id, index)));
      setContacts(applyRulesToContacts(dedupeContactsById(mapped), index));
      setActiveContactId((current) => current || mapped[0]?.id || "");
    } catch (err) {
      setSyncError(getErrorMessage(err));
    } finally {
      setLoadingChats(false);
    }
  }, []);

  const loadWaContacts = useCallback(async () => {
    try {
      const list = (await getContacts()) as ApiWaContact[];
      const index = rulesIndexRef.current;
      setWaContacts(
        applyRulesToContacts(
          dedupeContactsById(
            list
              .filter((c) => !c.isMe && !c.isGroup)
              .map((c) => waContactToContact(c, ruleForChat(c.id, index)))
          ),
          index
        )
      );
    } catch (err) {
      setSyncError(getErrorMessage(err));
    }
  }, []);

  const loadMessages = useCallback(
    async (chatId: string) => {
      if (loadedChatsRef.current.has(chatId)) return;

      setLoadingMessages(true);
      try {
        const raw = (await fetchChatMessages(chatId, { limit: 30 })) as ApiMessage[];
        loadedChatsRef.current.add(chatId);
        const chatContact = contactsRef.current.find((c) => c.id === chatId);
        const lookup = buildContactLookup([
          ...contactsRef.current,
          ...waContactsRef.current,
        ]);
        const ctx = {
          lookup,
          chatContact,
          isGroup: chatContact?.isGroup ?? false,
        };
        const mapped = raw.map((m) => apiMessageToMessage(m, ctx));
        setConversations((prev) => ({
          ...prev,
          [chatId]: {
            contactId: chatId,
            messages: mapped,
          },
        }));

        scheduleContactSummarySync(chatId, apiMessagesToSpliter(raw));
        void sendSeen(chatId).catch(() => undefined);
      } catch (err) {
        setSyncError(getErrorMessage(err));
      } finally {
        setLoadingMessages(false);
      }
    },
    [scheduleContactSummarySync]
  );

  const loadProfileIntoSettings = useCallback(async () => {
    try {
      const info = (await getClientInfo()) as {
        pushname?: string;
        phone?: string;
      };
      if (info.pushname) {
        setSettings((prev) =>
          prev.name.trim() ? prev : { ...prev, name: info.pushname! }
        );
      }
    } catch {
      // optional
    }
  }, []);

  useEffect(() => {
    void loadBusinessSettings();
    void loadCredits();
  }, [loadBusinessSettings, loadCredits]);

  useEffect(() => {
    if (!whatsAppReady) return;
    void loadAllChatRules();
  }, [whatsAppReady, loadAllChatRules]);

  useEffect(() => {
    if (!whatsAppReady) return;
    void loadChats();
    void loadWaContacts();
    void loadProfileIntoSettings();
  }, [whatsAppReady, loadChats, loadWaContacts, loadProfileIntoSettings]);

  useEffect(() => {
    if (!whatsAppReady || !activeContactId) return;
    void loadMessages(activeContactId);
    void loadChatSettings(activeContactId);
  }, [whatsAppReady, activeContactId, loadMessages, loadChatSettings]);

  const updateMessageReactions = useCallback(
    (chatId: string, messageId: string, reactions: MessageReaction[]) => {
      setConversations((prev) => {
        const conversation = prev[chatId];
        if (!conversation) return prev;
        return {
          ...prev,
          [chatId]: {
            ...conversation,
            messages: conversation.messages.map((message) =>
              message.id === messageId ? { ...message, reactions } : message
            ),
          },
        };
      });
    },
    []
  );

  const handleRealtimeMessage = useCallback((event: RealtimeMessageEvent) => {
    const { chatId, message, chat } = event;
    const isActiveChat = chatId === activeContactIdRef.current;

    if (!message.fromMe) {
      playIncomingMessageSound();
    }

    const index = rulesIndexRef.current;
    const currentContacts = contactsRef.current;
    const currentWaContacts = waContactsRef.current;
    const lookup = buildContactLookup([...currentContacts, ...currentWaContacts]);
    const chatContact =
      currentContacts.find((c) => c.id === chatId) ??
      (chat ? chatToContact(chat, ruleForChat(chatId, index)) : undefined);

    const shouldAppendToConversation =
      isActiveChat || loadedChatsRef.current.has(chatId);

    if (shouldAppendToConversation) {
      const existing = conversationsRef.current[chatId];
      const messages = existing?.messages ?? [];
      if (!messages.some((m) => m.id === message.id)) {
        const mapped = apiMessageToMessage(message, {
          lookup,
          chatContact,
          isGroup: chatContact?.isGroup ?? chat?.isGroup ?? false,
        });

        setConversations((prev) => ({
          ...prev,
          [chatId]: {
            contactId: chatId,
            messages: [...(prev[chatId]?.messages ?? []), mapped],
          },
        }));

        scheduleContactSummarySync(
          chatId,
          dashboardMessagesToSpliter([...messages, mapped]),
          5000
        );
      }
    }

    if (isActiveChat) {
      void sendSeen(chatId).catch(() => undefined);
    }

    const preview = lastMessagePreview(message);
    const timeLabel = formatRelativeTime(message.timestamp ?? chat.timestamp);

    setContacts((prev) => {
      const idx = prev.findIndex((c) => c.id === chatId);
      const rule = ruleForChat(chatId, index);

      if (idx === -1) {
        if (!chat || chat.id.includes("@broadcast")) return prev;
        const created = chatToContact(chat, rule);
        return dedupeContactsById([
          {
            ...created,
            lastMessage: preview,
            lastMessageTime: timeLabel,
            unreadCount: isActiveChat || message.fromMe ? 0 : 1,
          },
          ...prev,
        ]);
      }

      const current = prev[idx]!;
      const updated: Contact = {
        ...current,
        lastMessage: preview,
        lastMessageTime: timeLabel,
        unreadCount:
          isActiveChat || message.fromMe
            ? current.unreadCount
            : current.unreadCount + 1,
      };

      const next = [...prev];
      next.splice(idx, 1);
      return [updated, ...next];
    });
  }, []);

  const handleRealtimeReaction = useCallback(
    (event: RealtimeReactionEvent) => {
      updateMessageReactions(event.chatId, event.messageId, event.reactions);
    },
    [updateMessageReactions]
  );

  const handleRealtimeEvent = useCallback(
    (event: RealtimeEvent) => {
      if (event.type === "message:new") {
        handleRealtimeMessage(event);
        return;
      }
      handleRealtimeReaction(event);
    },
    [handleRealtimeMessage, handleRealtimeReaction]
  );

  useWhatsAppRealtime({
    enabled: whatsAppReady,
    onEvent: handleRealtimeEvent,
  });

  const openContact = useCallback((id: string) => {
    setActiveContactId(id);
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !activeContactId) return;
      setSyncError(null);
      try {
        const sent = (await sendChatMessage(activeContactId, text.trim())) as ApiMessage;
        const chatContact = contacts.find((c) => c.id === activeContactId);
        const lookup = buildContactLookup([...contacts, ...waContacts]);
        const mapped = apiMessageToMessage(sent, {
          lookup,
          chatContact,
          isGroup: chatContact?.isGroup ?? false,
        });
        setConversations((prev) => ({
          ...prev,
          [activeContactId]: {
            contactId: activeContactId,
            messages: [...(prev[activeContactId]?.messages ?? []), mapped],
          },
        }));
        setContacts((prev) =>
          prev.map((c) =>
            c.id === activeContactId
              ? { ...c, lastMessage: text.trim(), lastMessageTime: "now" }
              : c
          )
        );
        void loadCredits();
      } catch (err) {
        setSyncError(getErrorMessage(err));
      }
    },
    [activeContactId, contacts, waContacts, loadCredits]
  );

  const sendReply = useCallback(
    async (messageId: string, text: string) => {
      if (!text.trim() || !activeContactId) return;
      setSyncError(null);
      try {
        const sent = (await replyWhatsAppMessage(messageId, text.trim())) as ApiMessage;
        const chatContact = contacts.find((c) => c.id === activeContactId);
        const lookup = buildContactLookup([...contacts, ...waContacts]);
        const mapped = apiMessageToMessage(sent, {
          lookup,
          chatContact,
          isGroup: chatContact?.isGroup ?? false,
        });
        loadedChatsRef.current.add(activeContactId);
      setConversations((prev) => ({
        ...prev,
        [activeContactId]: {
          contactId: activeContactId,
            messages: [...(prev[activeContactId]?.messages ?? []), mapped],
        },
      }));
      setContacts((prev) =>
        prev.map((c) =>
          c.id === activeContactId
            ? { ...c, lastMessage: text.trim(), lastMessageTime: "now" }
            : c
        )
      );
        void loadCredits();
      } catch (err) {
        setSyncError(getErrorMessage(err));
      }
    },
    [activeContactId, contacts, waContacts, loadCredits]
  );

  const reactToMessage = useCallback(
    async (messageId: string, emoji: string) => {
      if (!activeContactId) return;
      setSyncError(null);
      try {
        const result = (await reactWhatsAppMessage(messageId, emoji)) as {
          messageId: string;
          reactions: MessageReaction[];
        };
        updateMessageReactions(
          activeContactId,
          result.messageId ?? messageId,
          result.reactions ?? []
        );
      } catch (err) {
        setSyncError(getErrorMessage(err));
      }
    },
    [activeContactId, updateMessageReactions]
  );

  const editMessage = useCallback(
    async (contactId: string, messageId: string, newText: string) => {
      setSyncError(null);
      try {
        await editWhatsAppMessage(messageId, newText);
      setConversations((prev) => ({
        ...prev,
        [contactId]: {
          ...prev[contactId],
            messages: (prev[contactId]?.messages ?? []).map((m) =>
            m.id === messageId ? { ...m, text: newText, edited: true } : m
          ),
        },
      }));
      setEditingMessage(null);
      } catch (err) {
        setSyncError(getErrorMessage(err));
      }
    },
    []
  );

  const setContactRule = useCallback(
    async (contactId: string, rule: ContactRule) => {
      setSyncError(null);
      bumpChatSettingsGeneration(contactId);
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, rule } : c))
    );
      setWaContacts((prev) =>
        prev.map((c) => (c.id === contactId ? { ...c, rule } : c))
      );
      try {
        const saved = await saveChatRules(contactId, { rule });
        bumpChatSettingsGeneration(contactId);
        setContacts((prev) =>
          prev.map((c) => (c.id === contactId ? { ...c, rule: saved.rule } : c))
        );
        setWaContacts((prev) =>
          prev.map((c) => (c.id === contactId ? { ...c, rule: saved.rule } : c))
        );
        if (contactId === activeContactId) {
          setActiveChatSettings(saved);
          setActiveChatUsingDefault(false);
        }
        setChatRulesIndex((prev) => {
          const next = prev
            ? { ...prev, rules: { ...prev.rules, [contactId]: saved } }
            : prev;
          if (next) rulesIndexRef.current = next;
          return next;
        });
      } catch (err) {
        bumpChatSettingsGeneration(contactId);
        setSyncError(getErrorMessage(err));
        void loadChatSettings(contactId);
      }
    },
    [activeContactId, loadChatSettings]
  );

  const saveActiveContactSettings = useCallback(
    async (data: Partial<Omit<ChatRuleSettings, "chatId">>) => {
      if (!activeContactId) return;
      bumpChatSettingsGeneration(activeContactId);
      setSavingChatSettings(true);
      setSyncError(null);
      try {
        const saved = await saveChatRules(activeContactId, data);
        bumpChatSettingsGeneration(activeContactId);
        setActiveChatSettings(saved);
        setActiveChatUsingDefault(false);
        setContacts((prev) =>
          prev.map((c) =>
            c.id === activeContactId
              ? { ...c, rule: saved.rule, notes: saved.notes ?? undefined }
              : c
          )
        );
        setChatRulesIndex((prev) => {
          const next = prev
            ? { ...prev, rules: { ...prev.rules, [activeContactId]: saved } }
            : prev;
          if (next) rulesIndexRef.current = next;
          return next;
        });
      } catch (err) {
        setSyncError(getErrorMessage(err));
        throw err;
      } finally {
        setSavingChatSettings(false);
      }
    },
    [activeContactId]
  );

  const saveDefaultChatSettings = useCallback(
    async (data: Partial<Omit<ChatRuleSettings, "chatId">>) => {
      setSavingDefaultSettings(true);
      setSyncError(null);
      try {
        const saved = await saveDefaultChatRules(data);
        setDefaultChatSettings(saved);
        setChatRulesIndex((prev) => {
          const next = prev ? { ...prev, default: saved } : { default: saved, rules: {} };
          rulesIndexRef.current = next;
          setContacts((list) => applyRulesToContacts(list, next));
          setWaContacts((list) => applyRulesToContacts(list, next));
          return next;
        });
      } catch (err) {
        setSyncError(getErrorMessage(err));
        throw err;
      } finally {
        setSavingDefaultSettings(false);
      }
    },
    []
  );

  const updateSettings = useCallback(
    async (patch: Partial<BusinessSettings>) => {
      setSavingBusinessSettings(true);
      setSyncError(null);
      try {
        const saved = await saveBusinessSettings({
          ...settings,
          ...patch,
        });
        const { products: _legacyProducts, ...businessFields } = saved;
        setSettings(businessFields);
        try {
          if (patch.name) await setDisplayName(patch.name);
          if (patch.description) await setStatus(patch.description);
        } catch {
          // WhatsApp profile sync is optional
        }
      } catch (err) {
        setSyncError(getErrorMessage(err));
        throw err;
      } finally {
        setSavingBusinessSettings(false);
      }
    },
    [settings]
  );

  const addTriggerRule = useCallback((rule: Omit<TriggerRule, "id">) => {
    setTriggerRules((prev) => [...prev, { ...rule, id: Date.now() }]);
  }, []);

  const removeTriggerRule = useCallback((id: number) => {
    setTriggerRules((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const dismissSyncError = useCallback(() => setSyncError(null), []);

  const workspaceLoading = loadingRules || (whatsAppReady && loadingChats && contacts.length === 0);

  const activeContactSummary = activeContactId
    ? contactSummaries[activeContactId] ?? null
    : null;

  return {
    activeView,
    activeContactId,
    activeRightTab,
    activeContact,
    activeConversation,
    activeChatSettings,
    activeChatUsingDefault,
    defaultChatSettings,
    contacts,
    waContacts,
    conversations,
    settings,
    triggerRules,
    creditsBalance,
    creditsUsedToday,
    signupGrant,
    creditsPerMessage,
    dailyCreditsUsage,
    creditPackages,
    loadingCredits,
    refreshCredits,
    editingMessage,
    loadingChats,
    loadingMessages,
    loadingRules,
    loadingBusinessSettings,
    loadingChatSettings,
    savingChatSettings,
    savingDefaultSettings,
    savingBusinessSettings,
    workspaceLoading,
    syncError,
    dismissSyncError,
    contactSummaries,
    activeContactSummary,
    loadingAllSummaries,
    fetchContactSummary,
    loadAllContactSummaries,
    setActiveView,
    setActiveRightTab,
    openContact,
    sendMessage,
    sendReply,
    reactToMessage,
    editMessage,
    setEditingMessage,
    setContactRule,
    saveActiveContactSettings,
    saveDefaultChatSettings,
    updateSettings,
    addTriggerRule,
    removeTriggerRule,
    setCreditsBalance,
    refreshChats: loadChats,
    refreshContacts: loadWaContacts,
    refreshChatRules: loadAllChatRules,
  };
}

export type DashboardStore = ReturnType<typeof useDashboardStore>;
