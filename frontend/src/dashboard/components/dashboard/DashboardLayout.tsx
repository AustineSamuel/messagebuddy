"use client";

import Sidebar from "@/dashboard/components/dashboard/Sidebar";
import ChatList from "@/dashboard/components/chat/ChatList";
import ChatArea from "@/dashboard/components/chat/ChatArea";
import RightPanel from "@/dashboard/components/chat/RightPanel";
import DashboardAnalytics from "@/dashboard/components/dashboard/DashboardAnalytics";
import ContactsPage from "@/dashboard/components/contacts/ContactsPage";
import SettingsPage from "@/dashboard/components/settings/SettingsPage";
import { useDashboardStore } from "@/dashboard/hooks/useDashboardStore";
import { DEMO_DAILY_CREDITS } from "@/dashboard/data/demo";

export default function DashboardLayout() {
  const store = useDashboardStore();
  const creditsToday = DEMO_DAILY_CREDITS[DEMO_DAILY_CREDITS.length - 1].used;

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        background: "var(--bg-base)",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* ── Sidebar ── */}
      <Sidebar activeView={store.activeView} onNavigate={store.setActiveView} />

      {/* ── Main content ── */}
      {store.activeView === "chats" && (
        <>
          <ChatList
            contacts={store.contacts}
            activeContactId={store.activeContactId}
            onSelectContact={store.openContact}
          />
          <ChatArea
            contact={store.activeContact}
            conversation={store.activeConversation}
            onSendMessage={store.sendMessage}
            onEditMessage={(msgId, newText) =>
              store.editMessage(store.activeContactId, msgId, newText)
            }
            creditsToday={creditsToday}
          />
          <RightPanel
            contact={store.activeContact}
            activeTab={store.activeRightTab}
            onTabChange={store.setActiveRightTab}
            triggerRules={store.triggerRules}
            onAddTriggerRule={store.addTriggerRule}
            onRemoveTriggerRule={store.removeTriggerRule}
            creditsBalance={store.creditsBalance}
          />
        </>
      )}

      {store.activeView === "dashboard" && (
        <DashboardAnalytics creditsBalance={store.creditsBalance} />
      )}

      {store.activeView === "contacts" && (
        <ContactsPage
          contacts={store.contacts}
          onSetRule={store.setContactRule}
        />
      )}

      {store.activeView === "settings" && (
        <SettingsPage
          settings={store.settings}
          products={store.products}
          triggerRules={store.triggerRules}
          onUpdateSettings={store.updateSettings}
          onAddProduct={store.addProduct}
          onRemoveProduct={store.removeProduct}
        />
      )}
    </div>
  );
}
