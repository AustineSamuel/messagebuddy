"use client";

import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "@/app/lib/api";
import type {
  Contact,
  ContactRule,
  Message,
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
  chatToContact,
  getStoredContactRule,
  writeContactRule,
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
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<{
    contactId: string;
    messageId: string;
    text: string;
  } | null>(null);

  const activeContact =
    contacts.find((c) => c.id === activeContactId) ?? contacts[0];
  const activeConversation = activeContactId
    ? conversations[activeContactId]
    : undefined;

  const loadChats = useCallback(async () => {
    setLoadingChats(true);
    setSyncError(null);
    try {
      const chats = (await getChats()) as ApiChat[];
      const mapped = chats
        .filter((c) => !c.id.includes("@broadcast"))
        .map((chat) => chatToContact(chat, getStoredContactRule(chat.id)));
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
      setWaContacts(
        list
          .filter((c) => !c.isMe && !c.isGroup)
          .map((c) => waContactToContact(c, getStoredContactRule(c.id)))
      );
    } catch (err) {
      setSyncError(getErrorMessage(err));
    }
  }, []);

  const loadMessages = useCallback(async (chatId: string) => {
    setLoadingMessages(true);
    try {
      const raw = (await fetchChatMessages(chatId, { limit: 50 })) as ApiMessage[];
      setConversations((prev) => ({
        ...prev,
        [chatId]: {
          contactId: chatId,
          messages: raw.map(apiMessageToMessage),
        },
      }));
      await sendSeen(chatId).catch(() => undefined);
    } catch (err) {
      setSyncError(getErrorMessage(err));
    } finally {
      setLoadingMessages(false);
    }
  }, []);

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
    void loadChats();
    void loadWaContacts();
    void loadProfileIntoSettings();
  }, [whatsAppReady, loadChats, loadWaContacts, loadProfileIntoSettings]);

  const openContact = useCallback(
    (id: string) => {
      setActiveContactId(id);
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
      );
      void loadMessages(id);
    },
    [loadMessages]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !activeContactId) return;
      setSyncError(null);
      try {
        const sent = (await sendChatMessage(activeContactId, text.trim())) as ApiMessage;
        const mapped = apiMessageToMessage(sent);
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
    [activeContactId]
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

  const setContactRule = useCallback((contactId: string, rule: ContactRule) => {
    writeContactRule(contactId, rule);
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, rule } : c))
    );
    setWaContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, rule } : c))
    );
  }, []);

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

  return {
    activeView,
    activeContactId,
    activeRightTab,
    activeContact,
    activeConversation,
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
    syncError,
    setActiveView,
    setActiveRightTab,
    openContact,
    sendMessage,
    editMessage,
    setEditingMessage,
    setContactRule,
    updateSettings,
    addProduct,
    removeProduct,
    addTriggerRule,
    removeTriggerRule,
    setCreditsBalance,
    refreshChats: loadChats,
    refreshContacts: loadWaContacts,
  };
}

export type DashboardStore = ReturnType<typeof useDashboardStore>;
