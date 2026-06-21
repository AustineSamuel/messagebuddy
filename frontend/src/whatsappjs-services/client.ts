import { apiFetch } from "@/app/lib/api";

/** Base path for all WhatsApp Web.js proxy endpoints. */
export const WHATSAPP_API = "/api/v1/whatsapp";

export function waFetch<T = unknown>(path: string, options: RequestInit = {}) {
  return apiFetch(`${WHATSAPP_API}${path}`, options) as Promise<T>;
}

export function waGet<T = unknown>(path: string) {
  return waFetch<T>(path, { method: "GET" });
}

export function waPost<T = unknown>(path: string, body?: unknown) {
  return waFetch<T>(path, {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function waPut<T = unknown>(path: string, body?: unknown) {
  return waFetch<T>(path, {
    method: "PUT",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function waPatch<T = unknown>(path: string, body?: unknown) {
  return waFetch<T>(path, {
    method: "PATCH",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function waDelete<T = unknown>(path: string, query?: Record<string, string>) {
  const qs =
    query && Object.keys(query).length
      ? `?${new URLSearchParams(query).toString()}`
      : "";
  return waFetch<T>(`${path}${qs}`, { method: "DELETE" });
}
