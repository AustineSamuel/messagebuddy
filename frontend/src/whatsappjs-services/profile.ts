import { waDelete, waPatch, waPost } from "./client";

export async function setDisplayName(displayName: string) {
  return waPatch("/profile/display-name", { displayName });
}

export async function setStatus(status: string) {
  return waPatch("/profile/status", { status });
}

export async function setProfilePicture(media: Record<string, unknown>) {
  return waPost("/profile/picture", { media });
}

export async function deleteProfilePicture() {
  return waDelete("/profile/picture");
}

export async function sendPresenceAvailable() {
  return waPost("/presence/available");
}

export async function sendPresenceUnavailable() {
  return waPost("/presence/unavailable");
}

export async function revokeStatusMessage(messageId: string) {
  return waPost(`/status/${encodeURIComponent(messageId)}/revoke`);
}
