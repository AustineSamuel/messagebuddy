import { waDelete, waFetch, waGet, waPost } from "./client";

export type WhatsAppContact = Record<string, unknown>;

export async function getContacts() {
  return waGet<WhatsAppContact[]>("/contacts");
}

export async function getBlockedContacts() {
  return waGet<WhatsAppContact[]>("/contacts/blocked");
}

export async function getContact(contactId: string) {
  return waGet<WhatsAppContact>(`/contacts/${encodeURIComponent(contactId)}`);
}

export async function blockContact(contactId: string) {
  return waPost(`/contacts/${encodeURIComponent(contactId)}/block`);
}

export async function unblockContact(contactId: string) {
  return waPost(`/contacts/${encodeURIComponent(contactId)}/unblock`);
}

export async function getProfilePicUrl(contactId: string) {
  return waGet<{ url: string }>(`/contacts/${encodeURIComponent(contactId)}/profile-pic`);
}

export async function getCommonGroups(contactId: string) {
  return waGet(`/contacts/${encodeURIComponent(contactId)}/common-groups`);
}

export async function getContactAbout(contactId: string) {
  return waGet<{ about: string | null }>(`/contacts/${encodeURIComponent(contactId)}/about`);
}

export async function lookupNumber(number: string) {
  return waPost<{ id: string | null }>("/contacts/lookup-number", { number });
}

export async function isRegisteredUser(id: string) {
  return waPost<{ registered: boolean }>("/contacts/is-registered", { id });
}

export async function getFormattedNumber(number: string) {
  return waPost<{ number: string }>("/contacts/formatted-number", { number });
}

export async function getCountryCode(number: string) {
  return waPost<{ countryCode: string }>("/contacts/country-code", { number });
}

export async function saveAddressbookContact(
  phoneNumber: string,
  firstName: string,
  lastName: string,
  syncToAddressbook?: boolean
) {
  return waPost("/contacts/addressbook", {
    phoneNumber,
    firstName,
    lastName,
    syncToAddressbook,
  });
}

export async function deleteAddressbookContact(phoneNumber: string) {
  return waFetch("/contacts/addressbook", {
    method: "DELETE",
    body: JSON.stringify({ phoneNumber }),
  });
}
