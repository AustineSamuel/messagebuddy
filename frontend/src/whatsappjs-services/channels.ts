import { waDelete, waGet, waPost } from "./client";

export async function getChannels() {
  return waGet("/channels");
}

export async function createChannel(title: string, options?: Record<string, unknown>) {
  return waPost("/channels", { title, options });
}

export async function searchChannels(searchOptions: Record<string, unknown>) {
  return waPost("/channels/search", searchOptions);
}

export async function getChannelByInviteCode(inviteCode: string) {
  return waGet(`/channels/invite/${encodeURIComponent(inviteCode)}`);
}

export async function deleteChannel(channelId: string) {
  return waDelete(`/channels/${encodeURIComponent(channelId)}`);
}

export async function subscribeToChannel(channelId: string) {
  return waPost(`/channels/${encodeURIComponent(channelId)}/subscribe`);
}

export async function unsubscribeFromChannel(
  channelId: string,
  options?: Record<string, unknown>
) {
  return waPost(`/channels/${encodeURIComponent(channelId)}/unsubscribe`, options);
}

export async function transferChannelOwnership(
  channelId: string,
  newOwnerId: string,
  options?: Record<string, unknown>
) {
  return waPost(`/channels/${encodeURIComponent(channelId)}/transfer-ownership`, {
    newOwnerId,
    options,
  });
}

export async function sendChannelAdminInvite(
  channelId: string,
  chatId: string,
  options?: Record<string, unknown>
) {
  return waPost(`/channels/${encodeURIComponent(channelId)}/admin-invite`, {
    chatId,
    options,
  });
}

export async function acceptChannelAdminInvite(channelId: string) {
  return waPost(`/channels/${encodeURIComponent(channelId)}/accept-admin-invite`);
}

export async function revokeChannelAdminInvite(channelId: string, userId: string) {
  return waPost(`/channels/${encodeURIComponent(channelId)}/revoke-admin-invite`, { userId });
}

export async function demoteChannelAdmin(channelId: string, userId: string) {
  return waPost(`/channels/${encodeURIComponent(channelId)}/demote-admin`, { userId });
}
