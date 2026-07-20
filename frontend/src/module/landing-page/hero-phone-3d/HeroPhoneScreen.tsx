"use client";

import { useEffect, useState } from "react";

type ChatLine =
  | { kind: "in"; text: string }
  | { kind: "out"; text: string; ai?: boolean }
  | { kind: "typing" };

const SCRIPT: ChatLine[] = [
  { kind: "in", text: "Hi! Do you still have the MacBook Pro?" },
  { kind: "typing" },
  {
    kind: "out",
    ai: true,
    text: "Yes — MacBook Pro 14\" M3 Pro, 512GB. ₦1,850,000. Like-new, charger included.",
  },
  { kind: "in", text: "What's the battery health?" },
  { kind: "typing" },
  {
    kind: "out",
    ai: true,
    text: "Battery at 94%. Delivery to Lekki tomorrow — ₦3,500. Reply PAY to reserve.",
  },
];

const TYPING_MS = 1400;
const PAUSE_MS = 900;
const LOOP_PAUSE_MS = 3200;

export default function HeroPhoneScreen({ paused = false }: { paused?: boolean }) {
  const [visible, setVisible] = useState<ChatLine[]>([]);
  const [showTyping, setShowTyping] = useState(false);

  useEffect(() => {
    if (paused) {
      setVisible([]);
      setShowTyping(false);
      return;
    }

    let cancelled = false;
    let timeout = 0;

    function wait(ms: number) {
      return new Promise<void>((resolve) => {
        timeout = window.setTimeout(resolve, ms);
      });
    }

    async function run() {
      while (!cancelled) {
        setVisible([]);
        setShowTyping(false);

        for (const line of SCRIPT) {
          if (cancelled) return;

          if (line.kind === "typing") {
            setShowTyping(true);
            await wait(TYPING_MS);
            if (cancelled) return;
            setShowTyping(false);
            continue;
          }

          setVisible((prev) => [...prev, line]);
          await wait(PAUSE_MS);
        }

        await wait(LOOP_PAUSE_MS);
      }
    }

    void run();

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [paused]);

  return (
    <div className="hero-phone-screen">
      <header className="hero-phone-screen__header">
        <button type="button" className="hero-phone-screen__back" aria-hidden>
          ‹
        </button>
        <div className="hero-phone-screen__contact">
          <span className="hero-phone-screen__avatar">T</span>
          <div>
            <p className="hero-phone-screen__name">TechHub Store</p>
            <p className="hero-phone-screen__status">online</p>
          </div>
        </div>
        <span className="hero-phone-screen__live">
          <span className="hero-phone-screen__live-dot" />
          AI live
        </span>
      </header>

      <div className="hero-phone-screen__chat">
        <div className="hero-phone-screen__day">Today</div>

        {visible.map((line, index) =>
          line.kind === "typing" ? null : (
            <div
              key={`${index}-${line.text.slice(0, 12)}`}
              className={`hero-phone-screen__bubble hero-phone-screen__bubble--${line.kind}${
                line.kind === "out" && line.ai ? " hero-phone-screen__bubble--ai" : ""
              }`}
            >
              {line.kind === "out" && line.ai ? (
                <span className="hero-phone-screen__ai-tag">AI</span>
              ) : null}
              <p>{line.text}</p>
              <span className="hero-phone-screen__time">
                {line.kind === "out"
                  ? index % 2 === 0
                    ? "10:42 AM"
                    : "10:44 AM"
                  : index === 0
                    ? "10:41 AM"
                    : "10:43 AM"}
              </span>
            </div>
          )
        )}

        {showTyping ? (
          <div className="hero-phone-screen__bubble hero-phone-screen__bubble--out hero-phone-screen__bubble--ai hero-phone-screen__bubble--typing">
            <span className="hero-phone-screen__ai-tag">AI</span>
            <span className="hero-phone-screen__typing">
              <span />
              <span />
              <span />
            </span>
          </div>
        ) : null}
      </div>

      <footer className="hero-phone-screen__composer" aria-hidden>
        <span className="hero-phone-screen__composer-pill">Message</span>
        <span className="hero-phone-screen__composer-send">➤</span>
      </footer>
    </div>
  );
}
