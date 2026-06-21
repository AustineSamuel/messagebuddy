"use client";

import { useState, useCallback } from "react";
import type {
  Contact,
  Message,
  NavView,
  RightTab,
  Product,
  BusinessSettings,
  TriggerRule,
  ContactRule,
} from "@/dashboard/types";
import {
  DEMO_CONTACTS,
  DEMO_CONVERSATIONS,
  DEMO_PRODUCTS,
  DEMO_BUSINESS_SETTINGS,
  DEMO_TRIGGER_RULES,
  DEMO_CREDITS_BALANCE,
} from "@/dashboard/data/demo";

export function useDashboardStore() {
  const [activeView, setActiveView] = useState<NavView>("chats");
  const [activeContactId, setActiveContactId] = useState<number>(1);
  const [activeRightTab, setActiveRightTab] = useState<RightTab>("info");
  const [contacts, setContacts] = useState<Contact[]>(DEMO_CONTACTS);
  const [conversations, setConversations] = useState(DEMO_CONVERSATIONS);
  const [products, setProducts] = useState<Product[]>(DEMO_PRODUCTS);
  const [settings, setSettings] = useState<BusinessSettings>(DEMO_BUSINESS_SETTINGS);
  const [triggerRules, setTriggerRules] = useState<TriggerRule[]>(DEMO_TRIGGER_RULES);
  const [creditsBalance, setCreditsBalance] = useState(DEMO_CREDITS_BALANCE);
  const [editingMessage, setEditingMessage] = useState<{
    contactId: number;
    messageId: string;
    text: string;
  } | null>(null);

  const activeContact = contacts.find((c) => c.id === activeContactId) ?? contacts[0];
  const activeConversation = conversations[activeContactId];

  const openContact = useCallback((id: number) => {
    setActiveContactId(id);
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      const newMsg: Message = {
        id: `msg-${Date.now()}`,
        direction: "out",
        text: text.trim(),
        time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        aiGenerated: false,
      };
      setConversations((prev) => ({
        ...prev,
        [activeContactId]: {
          contactId: activeContactId,
          messages: [...(prev[activeContactId]?.messages ?? []), newMsg],
        },
      }));
      setContacts((prev) =>
        prev.map((c) =>
          c.id === activeContactId
            ? { ...c, lastMessage: text.trim(), lastMessageTime: "now" }
            : c
        )
      );
    },
    [activeContactId]
  );

  const editMessage = useCallback(
    (contactId: number, messageId: string, newText: string) => {
      setConversations((prev) => ({
        ...prev,
        [contactId]: {
          ...prev[contactId],
          messages: prev[contactId].messages.map((m) =>
            m.id === messageId ? { ...m, text: newText, edited: true } : m
          ),
        },
      }));
      setEditingMessage(null);
    },
    []
  );

  const setContactRule = useCallback((contactId: number, rule: ContactRule) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, rule } : c))
    );
  }, []);

  const updateSettings = useCallback((patch: Partial<BusinessSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const addProduct = useCallback((product: Omit<Product, "id">) => {
    setProducts((prev) => [
      ...prev,
      { ...product, id: Date.now() },
    ]);
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
    // State
    activeView,
    activeContactId,
    activeRightTab,
    activeContact,
    activeConversation,
    contacts,
    conversations,
    products,
    settings,
    triggerRules,
    creditsBalance,
    editingMessage,
    // Actions
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
  };
}

export type DashboardStore = ReturnType<typeof useDashboardStore>;
