import { useEffect, useState } from "react";

/** Wait until document, fonts, and layout/CSS are ready before 3D phone animates. */
export function usePhoneStylesReady(enabled: boolean) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function waitForReady() {
      if (document.readyState !== "complete") {
        await new Promise<void>((resolve) => {
          window.addEventListener("load", () => resolve(), { once: true });
        });
      }

      try {
        await document.fonts.ready;
      } catch {
        // ignore
      }

      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });

      if (!cancelled) {
        setReady(true);
      }
    }

    void waitForReady();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return ready;
}
