"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/dashboard/components/dashboard/Sidebar";
import ChatList from "@/dashboard/components/chat/ChatList";
import ChatArea from "@/dashboard/components/chat/ChatArea";
import RightPanel from "@/dashboard/components/chat/RightPanel";
import DashboardAnalytics from "@/dashboard/components/dashboard/DashboardAnalytics";
import ContactsPage from "@/dashboard/components/contacts/ContactsPage";
import SettingsPage from "@/dashboard/components/settings/SettingsPage";
import WhatsAppConnectScreen from "@/dashboard/components/whatsapp/WhatsAppConnectScreen";
import WhatsAppSyncingScreen from "@/dashboard/components/whatsapp/WhatsAppSyncingScreen";
import { useDashboardStore } from "@/dashboard/hooks/useDashboardStore";
import { useWhatsAppSession } from "@/dashboard/hooks/useWhatsAppSession";
import DismissibleAlert from "@/dashboard/components/ui/DismissibleAlert";
import {
  ConnectScreenSkeleton,
  DashboardWorkspaceSkeleton,
  SettingsPageSkeleton,
} from "@/dashboard/components/ui/WhatsAppSkeleton";
import { DEMO_DAILY_CREDITS } from "@/dashboard/data/demo";

interface DashboardLayoutProps {
  onLogout?: () => void;
}

export default function DashboardLayout({ onLogout }: DashboardLayoutProps) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const wa = useWhatsAppSession();
  const store = useDashboardStore({ whatsAppReady: wa.isReady });

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("dashboard-theme");
    setTheme(storedTheme === "light" ? "light" : "dark");
  }, []);

  useEffect(() => {
    const id = "dashboard-stylesheet";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = "/dashboard.css";
      document.head.appendChild(link);
    }

    const root = document.documentElement;
    root.classList.toggle("light", theme === "light");
    window.localStorage.setItem("dashboard-theme", theme);

    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
      root.classList.remove("light");
    };
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  const creditsToday = DEMO_DAILY_CREDITS[DEMO_DAILY_CREDITS.length - 1].used;
  const contactsForPage =
    store.waContacts.length > 0 ? store.waContacts : store.contacts;

  const sessionStatus = wa.session?.status ?? "disconnected";
  const isSessionBooting =
    sessionStatus === "initializing" || sessionStatus === "authenticated";

  if (wa.loading && !wa.session) {
    return <ConnectScreenSkeleton />;
  }

  if (!wa.isReady) {
    if (wa.connecting || isSessionBooting) {
      return (
        <WhatsAppSyncingScreen session={wa.session} onRefresh={wa.refresh} />
      );
    }
    return (
      <WhatsAppConnectScreen
        session={wa.session}
        connecting={wa.connecting}
        error={wa.error}
        onConnect={wa.connect}
        onRefresh={wa.refresh}
        onDismissError={wa.dismissError}
      />
    );
  }

  if (store.workspaceLoading && store.activeView === "chats") {
    return (
      <div className="relative h-screen w-full overflow-hidden" style={{ background: "var(--bg-base)" }}>
        <DashboardWorkspaceSkeleton />
      </div>
    );
  }

  return (
    <div
      className="relative h-screen w-full overflow-hidden"
      style={{
        background: "var(--bg-base)",
        fontFamily: "var(--font-sans)",
      }}
    >
      <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className={
            theme === "dark"
              ? "rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
              : "rounded-full border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-200"
          }
        >
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
        {onLogout ? (
          <button
            type="button"
            onClick={onLogout}
            className="rounded-full bg-red-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-600"
          >
            Logout
          </button>
        ) : null}
      </div>

      {store.syncError ? (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 12,
            transform: "translateX(-50%)",
            zIndex: 30,
            width: "min(520px, calc(100% - 32px))",
          }}
        >
          <DismissibleAlert
            message={store.syncError}
            onDismiss={store.dismissSyncError}
          />
        </div>
      ) : null}

      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          overflow: "hidden",
        }}
      >
        <Sidebar activeView={store.activeView} onNavigate={store.setActiveView} />

        {store.activeView === "chats" && (
          <>
            <ChatList
              contacts={store.contacts}
              activeContactId={store.activeContactId}
              onSelectContact={store.openContact}
              loading={store.loadingChats}
              onRefresh={store.refreshChats}
            />
            <ChatArea
              contact={store.activeContact}
              conversation={store.activeConversation}
              onSendMessage={store.sendMessage}
              onEditMessage={(msgId, newText) =>
                store.editMessage(store.activeContactId, msgId, newText)
              }
              creditsToday={creditsToday}
              loadingMessages={store.loadingMessages}
            />
            {store.activeContact ? (
              <RightPanel
                contact={store.activeContact}
                activeTab={store.activeRightTab}
                onTabChange={store.setActiveRightTab}
                triggerRules={store.triggerRules}
                onAddTriggerRule={store.addTriggerRule}
                onRemoveTriggerRule={store.removeTriggerRule}
                creditsBalance={store.creditsBalance}
                chatSettings={store.activeChatSettings}
                loadingSettings={store.loadingChatSettings}
                savingSettings={store.savingChatSettings}
                onSaveSettings={store.saveActiveContactSettings}
                onRuleChange={store.setContactRule}
              />
            ) : null}
          </>
        )}

        {store.activeView === "dashboard" && (
          <DashboardAnalytics creditsBalance={store.creditsBalance} />
        )}

        {store.activeView === "contacts" && (
          <ContactsPage contacts={contactsForPage} onSetRule={store.setContactRule} />
        )}

        {store.activeView === "settings" && (
          store.loadingRules ? (
            <SettingsPageSkeleton />
          ) : (
          <SettingsPage
            settings={store.settings}
            products={store.products}
            triggerRules={store.triggerRules}
            defaultChatSettings={store.defaultChatSettings}
            savingDefaultSettings={store.savingDefaultSettings}
            onSaveDefaultChatSettings={store.saveDefaultChatSettings}
            onUpdateSettings={store.updateSettings}
            onAddProduct={store.addProduct}
            onRemoveProduct={store.removeProduct}
          />
          )
        )}
      </div>
    </div>
  );
}
