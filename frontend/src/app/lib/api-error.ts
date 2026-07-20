import { getFirebaseAuthErrorMessage } from "./firebase-auth-error";

type ValidationError = { message?: string; field?: string };
type ErrorPayload = {
  error?: unknown;
  message?: unknown;
  errors?: ValidationError[];
};

const STATUS_MESSAGES: Record<number, string> = {
  400: "That request wasn't valid. Please check your input.",
  401: "Please sign in to continue.",
  403: "You don't have permission to do that.",
  404: "We couldn't find what you're looking for.",
  409: "That already exists. Try signing in instead.",
  422: "Please check your input and try again.",
  429: "Too many requests. Please wait a moment and try again.",
  500: "Something went wrong on our side. Please try again.",
  503: "The service is temporarily unavailable. Please try again.",
};

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function readString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function messageFromPayload(body: ErrorPayload): string | null {
  if (Array.isArray(body.errors) && body.errors.length > 0) {
    const messages = body.errors
      .map((entry) => readString(entry.message))
      .filter((msg): msg is string => Boolean(msg));
    if (messages.length > 0) {
      return messages.join(" ");
    }
  }

  const directMessage = readString(body.message);
  if (directMessage) return directMessage;

  const directError = readString(body.error);
  if (directError) return directError;

  if (body.error && typeof body.error === "object" && body.error !== null) {
    const nested = readString((body.error as { message?: unknown }).message);
    if (nested) return nested;
  }

  return null;
}

/** Turn an API error body + HTTP status into a short, user-facing message. */
export function extractApiErrorMessage(status: number, body: unknown): string {
  if (body && typeof body === "object") {
    const fromRoot = messageFromPayload(body as ErrorPayload);
    if (fromRoot) return fromRoot;

    if ("data" in body && body.data && typeof body.data === "object") {
      const fromData = messageFromPayload(body.data as ErrorPayload);
      if (fromData) return fromData;
    }
  }

  if (status in STATUS_MESSAGES) {
    return STATUS_MESSAGES[status]!;
  }

  if (status >= 500) {
    return "Something went wrong on our side. Please try again.";
  }

  if (status >= 400) {
    return "Something went wrong. Please try again.";
  }

  return "Something went wrong. Please try again.";
}

export function getErrorMessage(
  err: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  const firebaseMessage = getFirebaseAuthErrorMessage(err, fallback);
  if (firebaseMessage) return firebaseMessage;
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error && err.message.trim()) return err.message;
  return fallback;
}

export function isUnauthorizedError(err: unknown): boolean {
  return err instanceof ApiError && (err.status === 401 || err.status === 403);
}
