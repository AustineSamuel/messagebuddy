import { waGet, waPost } from "./client";

export async function getLabels() {
  return waGet("/labels");
}

export async function getLabel(labelId: string) {
  return waGet(`/labels/${encodeURIComponent(labelId)}`);
}

export async function getChatsByLabel(labelId: string) {
  return waGet(`/labels/${encodeURIComponent(labelId)}/chats`);
}

export async function assignLabels(labelIds: string[], chatIds: string[]) {
  return waPost("/labels/assign", { labelIds, chatIds });
}
