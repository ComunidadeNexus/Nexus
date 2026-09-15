import { CaktoClient } from "./client.ts";
import { CaktoSubaccountPendingError } from "./errors.ts";
import type { CaktoCreateProductInput, CaktoProduct } from "./types.ts";

const client = new CaktoClient();

type CheckoutRow = { id?: string; default?: boolean; offers?: Array<{ id?: string }> };

export function caktoConfigured(): boolean {
  return client.isConfigured();
}

export function checkoutUrlForOffer(offerId: string): string {
  return `https://pay.cakto.com.br/${offerId}`;
}

export async function createProduct(input: CaktoCreateProductInput): Promise<CaktoProduct> {
  return await client.request<CaktoProduct>("/public_api/products/", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function listProductCheckouts(productId: string): Promise<CheckoutRow[]> {
  const payload = await client.request<unknown>(`/public_api/products/${productId}/checkouts/`);
  if (Array.isArray(payload)) return payload as CheckoutRow[];
  const boxed = payload as { results?: CheckoutRow[] } | null;
  return boxed?.results || [];
}

export async function resolveOfferId(product: CaktoProduct, productId: string): Promise<string | null> {
  const fromProduct = product.offers?.[0]?.id;
  if (fromProduct) return fromProduct;
  const checkouts = await listProductCheckouts(productId);
  const fallback = checkouts.find((item) => item.default) || checkouts[0];
  return fallback?.offers?.[0]?.id || null;
}

/**
 * Endpoint oficial de subconta Cakto pendente de confirmação.
 * A API pública documentada (docs.cakto.com.br/llms.txt) não lista criação de subconta.
 */
export async function createProducerAccount(_input: Record<string, unknown>): Promise<never> {
  const enabled = (Deno.env.get("CAKTO_SUBACCOUNT_ENABLED") || "false").toLowerCase() === "true";
  if (!enabled) throw new CaktoSubaccountPendingError();
  throw new CaktoSubaccountPendingError();
}
