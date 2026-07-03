/** Share a store URL via Web Share API, or mailto when unavailable. */
export async function shareStoreUrl(
  url: string,
  businessName: string
): Promise<"shared" | "mailed" | "cancelled"> {
  const title = businessName.trim() || "My store";
  const text = `Shop at ${title}`;

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({ title, text, url });
      return "shared";
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return "cancelled";
      }
    }
  }

  const subject = encodeURIComponent(`Visit ${title}`);
  const body = encodeURIComponent(`Check out my store:\n\n${url}`);
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
  return "mailed";
}
