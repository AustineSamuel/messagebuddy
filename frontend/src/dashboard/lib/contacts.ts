import type { Contact } from "@/dashboard/types";

/** Keep first occurrence when WhatsApp returns duplicate ids. */
export function dedupeContactsById(contacts: Contact[]): Contact[] {
  const seen = new Map<string, Contact>();
  for (const contact of contacts) {
    if (!seen.has(contact.id)) {
      seen.set(contact.id, contact);
    }
  }
  return Array.from(seen.values());
}
