"use client";

import { ApiError, extractApiErrorMessage } from "./api-error";
import { getAuthToken } from "./auth-token";
import { getApiBase } from "./api-base";

const API_BASE = getApiBase();

function unwrapEnvelope(body: unknown): unknown {
  if (body && typeof body === "object" && "data" in body) {
    return (body as { data: unknown }).data;
  }
  return body;
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getAuthToken();
  let res: Response;

  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      }
    });
  } catch {
    throw new ApiError(
      "Unable to reach the server. Check your connection and try again.",
      0
    );
  }

  const contentType = res.headers.get("content-type");
  let body: unknown = null;

  if (contentType?.includes("application/json")) {
    try {
      body = await res.json();
    } catch {
      body = null;
    }
  }

  if (!res.ok) {
    throw new ApiError(extractApiErrorMessage(res.status, body), res.status);
  }

  return unwrapEnvelope(body);
}

export { ApiError, extractApiErrorMessage, getErrorMessage, isUnauthorizedError } from "./api-error";
