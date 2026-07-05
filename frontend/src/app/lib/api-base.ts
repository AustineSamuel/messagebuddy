/** Trim malformed .env values (spaces/quotes) for API base URL. */
export function getApiBase() {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.API_BASE_URL ||
    "https://messagebuddy.onrender.com";
  return raw.trim().replace(/^['"]|['"]$/g, "");
}
