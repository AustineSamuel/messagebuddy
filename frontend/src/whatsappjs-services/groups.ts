import { waDelete, waGet, waPatch, waPost } from "./client";

export async function createGroup(
  title: string,
  participants: string[],
  options?: Record<string, unknown>
) {
  return waPost("/groups", { title, participants, options });
}

export async function getInviteInfo(inviteCode: string) {
  return waGet(`/groups/invite/${encodeURIComponent(inviteCode)}`);
}

export async function joinGroup(inviteCode: string) {
  return waPost("/groups/join", { inviteCode });
}

export async function joinGroupV4(inviteInfo: Record<string, unknown>) {
  return waPost("/groups/join-v4", inviteInfo);
}

export async function getGroupInviteCode(groupId: string) {
  return waGet<{ inviteCode: string }>(`/groups/${encodeURIComponent(groupId)}/invite-code`);
}

export async function revokeGroupInvite(groupId: string) {
  return waPost(`/groups/${encodeURIComponent(groupId)}/revoke-invite`);
}

export async function leaveGroup(groupId: string) {
  return waPost(`/groups/${encodeURIComponent(groupId)}/leave`);
}

export async function addGroupParticipants(
  groupId: string,
  participantIds: string[],
  options?: Record<string, unknown>
) {
  return waPost(`/groups/${encodeURIComponent(groupId)}/participants/add`, {
    participantIds,
    options,
  });
}

export async function removeGroupParticipants(groupId: string, participantIds: string[]) {
  return waPost(`/groups/${encodeURIComponent(groupId)}/participants/remove`, {
    participantIds,
  });
}

export async function promoteGroupParticipants(groupId: string, participantIds: string[]) {
  return waPost(`/groups/${encodeURIComponent(groupId)}/participants/promote`, {
    participantIds,
  });
}

export async function demoteGroupParticipants(groupId: string, participantIds: string[]) {
  return waPost(`/groups/${encodeURIComponent(groupId)}/participants/demote`, {
    participantIds,
  });
}

export async function setGroupSubject(groupId: string, subject: string) {
  return waPatch(`/groups/${encodeURIComponent(groupId)}/subject`, { subject });
}

export async function setGroupDescription(groupId: string, description: string) {
  return waPatch(`/groups/${encodeURIComponent(groupId)}/description`, { description });
}

export async function setGroupPicture(groupId: string, media: Record<string, unknown>) {
  return waPost(`/groups/${encodeURIComponent(groupId)}/picture`, { media });
}

export async function deleteGroupPicture(groupId: string) {
  return waDelete(`/groups/${encodeURIComponent(groupId)}/picture`);
}

export async function getGroupMembershipRequests(groupId: string) {
  return waGet(`/groups/${encodeURIComponent(groupId)}/membership-requests`);
}

export async function approveGroupMembershipRequests(
  groupId: string,
  options?: Record<string, unknown>
) {
  return waPost(`/groups/${encodeURIComponent(groupId)}/membership-requests/approve`, options);
}

export async function rejectGroupMembershipRequests(
  groupId: string,
  options?: Record<string, unknown>
) {
  return waPost(`/groups/${encodeURIComponent(groupId)}/membership-requests/reject`, options);
}

export async function setGroupInfoAdminsOnly(groupId: string, adminsOnly?: boolean) {
  return waPatch(`/groups/${encodeURIComponent(groupId)}/settings/info-admins-only`, {
    adminsOnly,
  });
}

export async function setGroupMessagesAdminsOnly(groupId: string, adminsOnly?: boolean) {
  return waPatch(`/groups/${encodeURIComponent(groupId)}/settings/messages-admins-only`, {
    adminsOnly,
  });
}

export async function setGroupAddMembersAdminsOnly(groupId: string, adminsOnly?: boolean) {
  return waPatch(`/groups/${encodeURIComponent(groupId)}/settings/add-members-admins-only`, {
    adminsOnly,
  });
}
