export const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,24}$/;

export function normalizeUsername(value: string): string {
  return (value || "").trim().replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
}

export function isValidUsername(value: string): boolean {
  const normalized = normalizeUsername(value);
  return USERNAME_PATTERN.test(normalized);
}
