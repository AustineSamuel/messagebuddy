import type { Data } from "backend-data";
import { apiFetch } from "../lib/api";

export type AuthUser = Data.User;

export type AuthResponse = {
  user: AuthUser;
  token: string;
};

export async function signup(payload: {
  fullName: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const data = await apiFetch("/api/v1/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return data as AuthResponse;
}

export async function login(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const data = await apiFetch("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return data as AuthResponse;
}

export async function logout(): Promise<void> {
  await apiFetch("/api/v1/auth/logout", {
    method: "POST"
  });
}

