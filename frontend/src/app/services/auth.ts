import type { Data } from "backend-data";
import { apiFetch } from "../lib/api";
import { clearAuthToken, setAuthToken } from "../lib/auth-token";

export type AuthUser = Data.User;

export type AuthResponse = {
  user: AuthUser;
  token: string;
};

export async function signup(payload: {
  fullName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}): Promise<AuthResponse> {
  const data = (await apiFetch("/api/v1/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload)
  })) as AuthResponse;
  setAuthToken(data.token);
  return data;
}

export async function login(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const data = (await apiFetch("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  })) as {data: AuthResponse};
  setAuthToken(data.data.token);
  return data.data;
}

/** Exchange a Firebase ID token for an API access token (same shape as login). */
export async function loginWithFirebaseIdToken(
  idToken: string
): Promise<AuthResponse> {
  const data = (await apiFetch("/api/v1/auth/firebase", {
    method: "POST",
    body: JSON.stringify({ idToken })
  })) as AuthResponse;
  setAuthToken(data.token);
  return data;
}

export async function logout(): Promise<void> {
  try {
    await apiFetch("/api/v1/auth/logout", {
      method: "POST"
    });
  } finally {
    clearAuthToken();
  }
}

