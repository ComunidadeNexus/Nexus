const encoder = new TextEncoder();

function hex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacSha256(secret: string, data: BufferSource): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, data);
  return hex(sig);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i += 1) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export function webhookSecret(): string {
  return Deno.env.get("CAKTO_WEBHOOK_SECRET") || "";
}

export async function isFromCakto(
  rawBody: string,
  timestamp: string | null,
  signatureHeader: string | null,
  bodySecret: string | undefined,
): Promise<boolean> {
  const secret = webhookSecret();
  if (!secret) return false;

  if (timestamp && signatureHeader) {
    const age = Math.abs(Date.now() / 1000 - Number(timestamp));
    if (!Number.isFinite(age) || age > 5 * 60) return false;
    const payload = encoder.encode(`${timestamp}.`);
    const bodyBytes = encoder.encode(rawBody);
    const combined = new Uint8Array(payload.length + bodyBytes.length);
    combined.set(payload, 0);
    combined.set(bodyBytes, payload.length);
    const digest = await hmacSha256(secret, combined);
    const expected = `v1=${digest}`;
    const candidates = signatureHeader.split(",").map((part) => part.trim());
    return candidates.some((candidate) => timingSafeEqual(candidate, expected));
  }

  if (!bodySecret) return false;
  return timingSafeEqual(bodySecret, secret);
}
