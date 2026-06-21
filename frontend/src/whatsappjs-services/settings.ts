import { waPatch } from "./client";

export async function setAutoDownloadAudio(enabled: boolean) {
  return waPatch("/settings/auto-download/audio", { enabled });
}

export async function setAutoDownloadDocuments(enabled: boolean) {
  return waPatch("/settings/auto-download/documents", { enabled });
}

export async function setAutoDownloadPhotos(enabled: boolean) {
  return waPatch("/settings/auto-download/photos", { enabled });
}

export async function setAutoDownloadVideos(enabled: boolean) {
  return waPatch("/settings/auto-download/videos", { enabled });
}

export async function setBackgroundSync(enabled: boolean) {
  return waPatch("/settings/background-sync", { enabled });
}
