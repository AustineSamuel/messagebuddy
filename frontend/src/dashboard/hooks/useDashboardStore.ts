"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "@/app/lib/api";
import {
  getAllChatRules,
  getChatRules,
  saveChatRules,
  saveDefaultChatRules,
  type ChatRuleSettings,
  type ChatRulesIndex,
} from "@/app/services/chat-rules";
import type {
  Contact,
  ContactRule,
  NavView,
  RightTab,
  Product,
  BusinessSettings,
  TriggerRule,
  Conversation,
} from "@/dashboard/types";
import {
  DEMO_PRODUCTS,
  DEMO_BUSINESS_SETTINGS,
  DEMO_TRIGGER_RULES,
  DEMO_CREDITS_BALANCE,
} from "@/dashboard/data/demo";
import {
  apiMessageToMessage,
  buildContactLookup,
  chatToContact,
  waContactToContact,
  type ApiChat,
  type ApiMessage,
  type ApiWaContact,
} from "@/dashboard/lib/whatsapp-mappers";
import {
  fetchChatMessages,
  getChats,
  sendChatMessage,
  sendSeen,
} from "@/whatsappjs-services/chats";
import { editMessage as editWhatsAppMessage } from "@/whatsappjs-services/messages";
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

function applyRulesToContacts(list: Contact[], index: ChatRulesIndex | null) {
  return list.map((c) => ({
    ...c,
    rule: ruleForChat(c.id, index),
    notes: index?.rules[c.id]?.notes ?? index?.default.notes ?? c.notes,
  }));
}

export function useDashboardStore({ whatsAppReady }: Props) {
  const [activeView, setActiveView] = useState<NavView>("chats");
  const [activeContactId, setActiveContactId] = useState<string>("");
  const [activeRightTab, setActiveRightTab] = useState<RightTab>("info");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [waContacts, setWaContacts] = useState<Contact[]>([]);
  const [conversations, setConversations] = useState<Record<string, Conversation>>({});
  const [products, setProducts] = useState<Product[]>(DEMO_PRODUCTS);
  const [settings, setSettings] = useState<BusinessSettings>(DEMO_BUSINESS_SETTINGS);
  const [triggerRules, setTriggerRules] = useState<TriggerRule[]>(DEMO_TRIGGER_RULES);
  const [creditsBalance, setCreditsBalance] = useState(DEMO_CREDITS_BALANCE);
  const [chatRulesIndex, setChatRulesIndex] = useState<ChatRulesIndex | null>(null);
  const [activeChatSettings, setActiveChatSettings] = useState<ChatRuleSettings | null>(null);
  const [defaultChatSettings, setDefaultChatSettings] = useState<ChatRuleSettings | null>(null);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingRules, setLoadingRules] = useState(true);
  const [loadingChatSettings, setLoadingChatSettings] = useState(false);
  const [savingChatSettings, setSavingChatSettings] = useState(false);
  const [savingDefaultSettings, setSavingDefaultSettings] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<{
    contactId: string;
    messageId: string;
    text: string;
  } | null>(null);
  const rulesIndexRef = useRef<ChatRulesIndex | null>(null);
  const loadedChatsRef = useRef(new Set<string>());

  const activeContact =
    contacts.find((c) => c.id === activeContactId) ?? contacts[0];
  const activeConversation = activeContactId
    ? conversations[activeContactId]
    : undefined;

  const loadAllChatRules = useCallback(async () => {
    setLoadingRules(true);
    try {
      const index = await getAllChatRules();
      rulesIndexRef.current = index;
      setChatRulesIndex(index);
      setDefaultChatSettings(index.default);
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
    setLoadingChatSettings(true);
    try {
      const response = await getChatRules(chatId);
      setActiveChatSettings(response.settings);
      setDefaultChatSettings(response.default);
      setContacts((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? {
                ...c,
                rule: response.settings.rule,
                notes: response.settings.notes ?? undefined,
              }
            : c
        )
      );
    } catch (err) {
      setSyncError(getErrorMessage(err));
    } finally {
      setLoadingChatSettings(false);
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
      setContacts(mapped);
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
        list
          .filter((c) => !c.isMe && !c.isGroup)
          .map((c) => waContactToContact(c, ruleForChat(c.id, index)))
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
        const chatContact = contacts.find((c) => c.id === chatId);
        const lookup = buildContactLookup([...contacts, ...waContacts]);
        const ctx = {
          lookup,
          chatContact,
          isGroup: chatContact?.isGroup ?? false,
        };
        setConversations((prev) => ({
          ...prev,
          [chatId]: {
            contactId: chatId,
            messages: raw.map((m) => apiMessageToMessage(m, ctx)),
          },
        }));
        void sendSeen(chatId).catch(() => undefined);
      } catch (err) {
        setSyncError(getErrorMessage(err));
      } finally {
        setLoadingMessages(false);
      }
    },
    [contacts, waContacts]
  );

  const loadProfileIntoSettings = useCallback(async () => {
    try {
      const info = (await getClientInfo()) as {
        pushname?: string;
        phone?: string;
      };
      if (info.pushname) {
        setSettings((prev) => ({ ...prev, name: info.pushname! }));
      }
    } catch {
      // optional
    }
  }, []);

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
      } catch (err) {
        setSyncError(getErrorMessage(err));
      }
    },
    [activeContactId, contacts, waContacts]
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
      try {
        const saved = await saveChatRules(contactId, { rule });
        setContacts((prev) =>
          prev.map((c) => (c.id === contactId ? { ...c, rule: saved.rule } : c))
        );
        setWaContacts((prev) =>
          prev.map((c) => (c.id === contactId ? { ...c, rule: saved.rule } : c))
        );
        if (contactId === activeContactId) {
          setActiveChatSettings((prev) => (prev ? { ...prev, rule: saved.rule } : saved));
        }
        setChatRulesIndex((prev) =>
          prev
            ? {
                ...prev,
                rules: { ...prev.rules, [contactId]: saved },
              }
            : prev
        );
      } catch (err) {
        setSyncError(getErrorMessage(err));
      }
    },
    [activeContactId]
  );

  const saveActiveContactSettings = useCallback(
    async (data: Partial<Omit<ChatRuleSettings, "chatId">>) => {
      if (!activeContactId) return;
      setSavingChatSettings(true);
      setSyncError(null);
      try {
        const saved = await saveChatRules(activeContactId, data);
        setActiveChatSettings(saved);
        setContacts((prev) =>
          prev.map((c) =>
            c.id === activeContactId
              ? { ...c, rule: saved.rule, notes: saved.notes ?? undefined }
              : c
          )
        );
        setChatRulesIndex((prev) =>
          prev
            ? { ...prev, rules: { ...prev.rules, [activeContactId]: saved } }
            : prev
        );
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

  const updateSettings = useCallback(async (patch: Partial<BusinessSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
    try {
      if (patch.name) await setDisplayName(patch.name);
      if (patch.description) await setStatus(patch.description);
    } catch (err) {
      setSyncError(getErrorMessage(err));
    }
  }, []);

  const addProduct = useCallback((product: Omit<Product, "id">) => {
    setProducts((prev) => [...prev, { ...product, id: Date.now() }]);
  }, []);

  const removeProduct = useCallback((id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addTriggerRule = useCallback((rule: Omit<TriggerRule, "id">) => {
    setTriggerRules((prev) => [...prev, { ...rule, id: Date.now() }]);
  }, []);

  const removeTriggerRule = useCallback((id: number) => {
    setTriggerRules((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const dismissSyncError = useCallback(() => setSyncError(null), []);

  const workspaceLoading = loadingRules || (whatsAppReady && loadingChats && contacts.length === 0);

  return {
    activeView,
    activeContactId,
    activeRightTab,
    activeContact,
    activeConversation,
    activeChatSettings,
    defaultChatSettings,
    contacts,
    waContacts,
    conversations,
    products,
    settings,
    triggerRules,
    creditsBalance,
    editingMessage,
    loadingChats,
    loadingMessages,
    loadingRules,
    loadingChatSettings,
    savingChatSettings,
    savingDefaultSettings,
    workspaceLoading,
    syncError,
    dismissSyncError,
    setActiveView,
    setActiveRightTab,
    openContact,
    sendMessage,
    editMessage,
    setEditingMessage,
    setContactRule,
    saveActiveContactSettings,
    saveDefaultChatSettings,
    updateSettings,
    addProduct,
    removeProduct,
    addTriggerRule,
    removeTriggerRule,
    setCreditsBalance,
    refreshChats: loadChats,
    refreshContacts: loadWaContacts,
    refreshChatRules: loadAllChatRules,
  };
}

export type DashboardStore = ReturnType<typeof useDashboardStore>;
