"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/dashboard/components/dashboard/Sidebar";
import ChatList from "@/dashboard/components/chat/ChatList";
import ChatArea from "@/dashboard/components/chat/ChatArea";
import RightPanel from "@/dashboard/components/chat/RightPanel";
import DashboardAnalytics from "@/dashboard/components/dashboard/DashboardAnalytics";
import ContactsPage from "@/dashboard/components/contacts/ContactsPage";
import FollowUpsPage from "@/dashboard/components/followups/FollowUpsPage";
import BuyCreditsPage from "@/dashboard/components/credits/BuyCreditsPage";
import SettingsPage from "@/dashboard/components/settings/SettingsPage";
import ProductsPage from "@/dashboard/components/products/ProductsPage";
import WebsiteServicesPage from "@/dashboard/components/website/WebsiteServicesPage";
import ThemeToggle from "@/dashboard/components/ui/ThemeToggle";
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
import { dedupeContactsById } from "@/dashboard/lib/contacts";
import type { DailyCredits } from "@/dashboard/types";

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
    document.documentElement.classList.add("dashboard-active");

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
      root.classList.remove("dashboard-active");
    };
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  const creditsToday = store.creditsUsedToday;
  const totalUnread = useMemo(
    () => store.contacts.reduce((sum, contact) => sum + contact.unreadCount, 0),
    [store.contacts]
  );

  useEffect(() => {
    const baseTitle = "MessageBuddy";

    if (!wa.isReady || totalUnread <= 0) {
      document.title = baseTitle;
      return;
    }

    const label = totalUnread === 1 ? "unread message" : "unread messages";
    document.title = `(${totalUnread}) ${label} — ${baseTitle}`;

    return () => {
      document.title = baseTitle;
    };
  }, [totalUnread, wa.isReady]);

  const contactsForPage = useMemo(() => {
    const source = store.waContacts.length > 0 ? store.waContacts : store.contacts;
    return dedupeContactsById(source);
  }, [store.waContacts, store.contacts]);

  const sessionStatus = wa.session?.status ?? "disconnected";
  const hasQr = Boolean(wa.session?.qr || wa.session?.pairingCode);
  const isSessionBooting =
    !hasQr &&
    (sessionStatus === "initializing" || sessionStatus === "authenticated");

  if (wa.loading && !wa.session) {
    return <ConnectScreenSkeleton />;
  }

  if (!wa.isReady) {
    if (wa.connecting || isSessionBooting) {
      return (
        <WhatsAppSyncingScreen
          session={wa.session}
          error={wa.error}
          onRefresh={wa.refresh}
          onRetry={wa.retry}
        />
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
      <div className="dashboard-topbar">
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
        {onLogout ? (
          <button type="button" onClick={onLogout} className="dashboard-logout-btn">
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
              contactSummaries={store.contactSummaries}
              onPrefetchSummary={(chatId) => void store.fetchContactSummary(chatId)}
              onLoadAllSummaries={store.loadAllContactSummaries}
              loadingAllSummaries={store.loadingAllSummaries}
            />
            <ChatArea
              contact={store.activeContact}
              conversation={store.activeConversation}
              onSendMessage={store.sendMessage}
              onSendReply={store.sendReply}
              onReactToMessage={store.reactToMessage}
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
                creditsUsedToday={store.creditsUsedToday}
                dailyCreditsUsage={store.dailyCreditsUsage as DailyCredits[]}
                onBuyCredits={() => store.setActiveView("credits")}
                chatSettings={store.activeChatSettings}
                defaultChatSettings={store.defaultChatSettings}
                isUsingDefault={store.activeChatUsingDefault}
                loadingSettings={store.loadingChatSettings}
                savingSettings={store.savingChatSettings}
                onSaveSettings={store.saveActiveContactSettings}
                onRuleChange={store.setContactRule}
                contactSummary={store.activeContactSummary}
                onRefreshSummary={() =>
                  void store.fetchContactSummary(store.activeContactId, true)
                }
              />
            ) : null}
          </>
        )}

        {store.activeView === "dashboard" && (
          <DashboardAnalytics onBuyCredits={() => store.setActiveView("credits")} />
        )}

        {store.activeView === "credits" && (
          <BuyCreditsPage
            balance={store.creditsBalance}
            packages={store.creditPackages}
            creditsPerMessage={store.creditsPerMessage}
            onPurchased={store.refreshCredits}
          />
        )}

        {store.activeView === "contacts" && (
          <ContactsPage contacts={contactsForPage} onSetRule={store.setContactRule} />
        )}

        {store.activeView === "followups" && (
          <FollowUpsPage contacts={contactsForPage} />
        )}

        {store.activeView === "products" && <ProductsPage />}

        {store.activeView === "website" && (
          <WebsiteServicesPage
            businessName={store.settings.name}
            websiteUrl={store.settings.website}
          />
        )}

        {store.activeView === "settings" && (
          store.loadingRules || store.loadingBusinessSettings ? (
            <SettingsPageSkeleton />
          ) : (
          <SettingsPage
            settings={store.settings}
            triggerRules={store.triggerRules}
            defaultChatSettings={store.defaultChatSettings}
            savingDefaultSettings={store.savingDefaultSettings}
            savingBusinessSettings={store.savingBusinessSettings}
            onSaveDefaultChatSettings={store.saveDefaultChatSettings}
            onUpdateSettings={store.updateSettings}
            onOpenProducts={() => store.setActiveView("products")}
            onOpenWebsite={() => store.setActiveView("website")}
            whatsappConnected={wa.isReady}
            onLogoutWhatsApp={wa.logoutWhatsApp}
            onLogoutAccount={onLogout}
          />
          )
        )}
      </div>
    </div>
  );
}
