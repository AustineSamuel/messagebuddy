const DEFAULT_APP_NAME = "MessageBuddy";

/** Display name for the product — always from NEXT_PUBLIC_APP_NAME. */
export function getAppName(): string {
  const name = process.env.NEXT_PUBLIC_APP_NAME?.trim();
  return name && name.length > 0 ? name : DEFAULT_APP_NAME;
}

export function getAppInitials(name = getAppName()): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
