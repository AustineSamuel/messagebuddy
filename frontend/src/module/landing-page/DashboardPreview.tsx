"use client";

import type { ReactNode } from "react";
import LandingAudioMessageDemo from "./LandingAudioMessageDemo";
import LandingChatComposer from "./LandingChatComposer";
import LandingIcon from "./LandingIcons";

function MessageBubble({
  children,
  isOut,
  time,
}: {
  children: ReactNode;
  isOut?: boolean;
  time: string;
}) {
  return (
    <div
      className={`lp-preview-bubble ${isOut ? "lp-preview-bubble--out" : "lp-preview-bubble--in"}`}
    >
      <div className="lp-preview-bubble__content">{children}</div>
      <span className="lp-preview-bubble__time">{time}</span>
    </div>
  );
}

export default function DashboardPreview() {
  const chats = [
    { name: "Ada — iPhone 13", preview: "Voice message", unread: 2, active: true },
    { name: "Chidi — Delivery", preview: "Thanks, I'll pay now", unread: 0, active: false },
    { name: "Beauty Hub", preview: "Yes, we deliver to Lekki…", unread: 0, active: false },
  ];

  return (
    <div className="lp-dashboard-preview">
      <div className="lp-dashboard-preview__chrome">
        <div className="lp-dashboard-preview__dots">
          <span />
          <span />
          <span />
        </div>
        <div className="lp-dashboard-preview__url">
          <LandingIcon name="layout" size="sm" />
          app.messagebuddy.app/dashboard
        </div>
      </div>

      <div className="lp-dashboard-preview__layout">
        <aside className="lp-dashboard-preview__sidebar">
          <div className="lp-dashboard-preview__sidebar-label">
            <LandingIcon name="messages" size="sm" />
            Chats
          </div>
          <div className="lp-dashboard-preview__chat-list">
            {chats.map((chat) => (
              <div
                key={chat.name}
                className={`lp-dashboard-preview__chat-item${chat.active ? " is-active" : ""}`}
              >
                <div className="lp-dashboard-preview__chat-item-top">
                  <span className="lp-dashboard-preview__chat-name">{chat.name}</span>
                  {chat.unread > 0 ? (
                    <span className="lp-dashboard-preview__chat-badge">{chat.unread}</span>
                  ) : null}
                </div>
                <p className="lp-dashboard-preview__chat-preview">{chat.preview}</p>
              </div>
            ))}
          </div>
        </aside>

        <div className="lp-dashboard-preview__main">
          <div className="lp-dashboard-preview__header">
            <div>
              <p className="lp-dashboard-preview__contact">Ada — iPhone 13</p>
              <p className="lp-dashboard-preview__status">
                <span className="lp-dashboard-preview__status-dot" />
                Active now
              </p>
            </div>
            <span className="lp-dashboard-preview__rules">
              <LandingIcon name="clipboard" size="sm" />
              Rules saved
            </span>
          </div>

          <div className="lp-dashboard-preview__messages">
            <MessageBubble time="10:42 AM">
              Hi, is the iPhone 13 still available?
            </MessageBubble>

            <MessageBubble time="10:43 AM">
              <LandingAudioMessageDemo />
            </MessageBubble>

            <MessageBubble isOut time="10:44 AM">
              Yes! 256GB available. ₦485,000. Want photos?
            </MessageBubble>
          </div>

          <LandingChatComposer />
        </div>
      </div>
    </div>
  );
}
