import { getApiBase } from "@/app/lib/api-base";
import { getAuthToken } from "@/app/lib/auth-token";
import type { ContactSummaryResponse } from "@/whatsappjs-services/chats";

function unwrapEnvelope(body: unknown): unknown {
  if (body && typeof body === "object" && "data" in body) {
    return (body as { data: unknown }).data;
  }
  return body;
}

/**
 * Dev helper: GET /api/v1/whatsapp/chats/:chatId/contact-summary with Bearer token.
 * Logs the response to the console.
 */
export async function fetchContactSummaryTest(
  chatId: string
): Promise<ContactSummaryResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new Error(
      "No auth token found. Log in first (localStorage key: messagebuddy_api_token)."
    );
  }

  const url = `${getApiBase()}/api/v1/whatsapp/contact-summaries`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  let body: unknown = null;
  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    body = await res.json();
  }

  const data = unwrapEnvelope(body) as ContactSummaryResponse;

  console.log("[module/test] contact-summary", {
    chatId,
    url,
    status: res.status,
    ok: res.ok,
    data,
  });

  if (!res.ok) {
    throw new Error(
      typeof body === "object" && body && "message" in body
        ? String((body as { message: unknown }).message)
        : `Request failed (${res.status})`
    );
  }

  return data;
}
