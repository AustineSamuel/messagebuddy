import type { Data } from "backend-data";
import { apiFetch } from "../lib/api";

export type User = Data.User;

export async function getProfile(): Promise<User> {
  const data = await apiFetch("/api/v1/account/profile");
  return (data as { user: User }).user;
}

