const SLUG_MAX = 48;

export function slugifyNucleoName(name: string): string {
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX);
  return slug || "comunidade";
}

export function uniquifyNucleoSlug(base: string, attempt: number): string {
  const safeBase = slugifyNucleoName(base);
  if (attempt <= 0) return safeBase;
  const suffix = `-${attempt + 1}`;
  return `${safeBase.slice(0, Math.max(1, SLUG_MAX - suffix.length))}${suffix}`;
}
