import { waGet } from "./client";

export async function getBroadcasts() {
  return waGet("/broadcasts");
}

export async function getBroadcast(contactId: string) {
  return waGet(`/broadcasts/${encodeURIComponent(contactId)}`);
}
