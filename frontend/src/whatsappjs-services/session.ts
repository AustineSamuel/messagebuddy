import { waDelete, waGet, waPost } from "./client";

export type WhatsAppSession = {
  status: string;
  qr: string | null;
  pairingCode: string | null;
  lastError: string | null;
  loadingPercent: number | null;
};

export async function initializeSession() {
  return waPost<WhatsAppSession>("/session/initialize");
}

export async function getSession() {
  return waGet<WhatsAppSession>("/session");
}

export async function getSessionState() {
  return waGet<{ state: string | null }>("/session/state");
}

export async function getQrCode() {
  return waGet<{ qr: string | null; status: string }>("/session/qr");
}

export async function requestPairingCode(phoneNumber: string, showNotification = true) {
  return waPost<{ pairingCode: string }>("/session/pairing-code", {
    phoneNumber,
    showNotification,
  });
}

export async function getClientInfo() {
  return waGet<Record<string, unknown>>("/session/info");
}

export async function getWWebVersion() {
  return waGet<{ version: string }>("/session/wweb-version");
}

export async function destroySession() {
  return waDelete<{ destroyed: boolean }>("/session");
}

export async function logoutSession() {
  return waPost<{ loggedOut: boolean }>("/session/logout");
}
