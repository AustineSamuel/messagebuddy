"use client";

const WAVE_HEIGHTS = [3, 8, 5, 12, 7, 14, 6, 10, 4, 9, 11, 5, 8, 6, 13, 7];

/** Static replica of AudioMessageContent with transcription shown (landing demo). */
export default function LandingAudioMessageDemo({
  transcription = "Hi, is the iPhone 13 still available? Can you deliver to Lekki tomorrow?",
  showTranscribed = true,
}: {
  transcription?: string;
  showTranscribed?: boolean;
}) {
  return (
    <div className="lp-preview-audio">
      <div className="lp-preview-audio__row">
        <div className="lp-preview-audio__icon" aria-hidden>
          🎤
        </div>
        <div className="lp-preview-audio__body">
          <div className="lp-preview-audio__label">Voice message</div>
          <div className="lp-preview-audio__wave">
            <span style={{ fontSize: 10, color: "var(--wa-green)", fontWeight: 700 }}>▶</span>
            <div className="lp-preview-audio__bars">
              {WAVE_HEIGHTS.map((h, i) => (
                <span key={i} className="lp-preview-audio__bar" style={{ height: h }} />
              ))}
            </div>
            <span className="lp-preview-audio__duration">0:08</span>
          </div>
        </div>
      </div>

      <button type="button" disabled className="lp-preview-audio__transcribe">
        {showTranscribed ? "Transcribed" : "Transcribe"}
      </button>

      {showTranscribed && transcription ? (
        <div className="lp-preview-audio__text">
          <div className="lp-preview-audio__text-label">Transcription</div>
          {transcription}
        </div>
      ) : null}
    </div>
  );
}
