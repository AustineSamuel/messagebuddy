"use client";

/** Static replica of the dashboard ChatArea composer for the landing preview. */
export default function LandingChatComposer() {
  return (
    <div className="lp-preview-composer">
      <div className="lp-preview-composer__row">
        <button type="button" aria-label="Attach file" className="lp-preview-composer__btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={15} height={15}>
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button>

        <div className="lp-preview-composer__input">Type a message...</div>

        <button type="button" aria-label="Emoji" className="lp-preview-composer__btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={15} height={15}>
            <circle cx="12" cy="12" r="10" />
            <path d="M8 13s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>

        <button type="button" className="lp-preview-composer__ai">
          ✨ AI
        </button>

        <button type="button" aria-label="Send" className="lp-preview-composer__send">
          <svg viewBox="0 0 24 24" fill="var(--text-3)" width={16} height={16} style={{ marginLeft: 2 }}>
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
