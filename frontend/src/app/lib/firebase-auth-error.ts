const FIREBASE_AUTH_CANCELLATIONS = new Set([
  "auth/popup-closed-by-user",
  "auth/cancelled-popup-request",
]);

const FIREBASE_AUTH_MESSAGES: Record<string, string> = {
  "auth/popup-closed-by-user":
    "You closed the sign-in window before finishing. Try again when you're ready.",
  "auth/cancelled-popup-request":
    "Sign-in was interrupted. Please try again.",
  "auth/popup-blocked":
    "Your browser blocked the Google sign-in window. Allow pop-ups for this site, then try again.",
  "auth/network-request-failed":
    "We couldn't reach Google. Check your internet connection and try again.",
  "auth/too-many-requests":
    "Too many sign-in attempts. Please wait a few minutes and try again.",
  "auth/user-disabled":
    "This Google account can't be used to sign in. Contact support if you need help.",
  "auth/operation-not-allowed":
    "Google sign-in isn't available right now. Please try again later or use email instead.",
  "auth/account-exists-with-different-credential":
    "An account already exists with this email using a different sign-in method. Try signing in with email instead.",
  "auth/invalid-api-key":
    "Sign-in isn't set up correctly on our side. Please contact support.",
  "auth/internal-error":
    "Something went wrong while signing in. Please try again.",
};

function readFirebaseAuthCode(err: unknown): string | null {
  if (err && typeof err === "object" && "code" in err) {
    const code = (err as { code?: unknown }).code;
    if (typeof code === "string" && code.startsWith("auth/")) {
      return code;
    }
  }

  if (err instanceof Error) {
    const match = err.message.match(/\(auth\/[^)]+\)/);
    if (match) {
      return match[0].slice(1, -1);
    }
  }

  return null;
}

/** Turn Firebase Auth errors into short, human-friendly copy. */
export function getFirebaseAuthErrorMessage(
  err: unknown,
  fallback = "We couldn't sign you in with Google. Please try again."
): string | null {
  const code = readFirebaseAuthCode(err);
  if (!code) return null;

  return FIREBASE_AUTH_MESSAGES[code] ?? fallback;
}

/** User closed or cancelled sign-in — no error message needed. */
export function isFirebaseAuthCancellation(err: unknown): boolean {
  const code = readFirebaseAuthCode(err);
  return code !== null && FIREBASE_AUTH_CANCELLATIONS.has(code);
}
