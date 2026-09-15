export type CaktoEventType =
  | "purchase_approved"
  | "purchase_refused"
  | "refund"
  | "chargeback"
  | "pix_gerado"
  | "boleto_gerado"
  | "subscription_created"
  | "subscription_renewed"
  | "subscription_renewal_refused"
  | "subscription_canceled"
  | "subscription_paused"
  | "subscription_resumed"
  | "subscription_late"
  | "subscription_late_recovered"
  | "checkout_abandonment";

export type CaktoTokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope?: string;
};

export type CaktoCreateProductInput = {
  name: string;
  description: string;
  price: number;
  type: "unique" | "subscription";
  salesPage: string;
};

export type CaktoProduct = {
  id?: string;
  short_id?: string;
  name?: string;
  offers?: Array<{ id?: string; price?: number }>;
};

export type CaktoWebhookEnvelope = {
  secret?: string;
  event?: string;
  data?: CaktoOrderData | CaktoOrderData[];
};

export type CaktoCommission = {
  user?: string;
  type?: string;
  percentage?: number;
  totalAmount?: number;
};

export type CaktoOrderData = {
  id?: string;
  refId?: string;
  status?: string;
  amount?: number | null;
  fees?: number | null;
  paymentMethod?: string;
  customer?: {
    id?: number | string;
    name?: string;
    email?: string;
    phone?: string;
  };
  product?: { id?: string; name?: string; type?: string };
  offer?: { id?: string; name?: string; price?: number; currency?: string };
  commissions?: CaktoCommission[];
  subscription?: { id?: string | number } | null;
  createdAt?: string;
  paidAt?: string | null;
};

export function firstOrderData(data: CaktoWebhookEnvelope["data"]): CaktoOrderData | null {
  if (!data) return null;
  if (Array.isArray(data)) return data[0] ?? null;
  return data;
}

export function webhookEventId(event: string, data: CaktoOrderData | null): string {
  if (data?.id) return `${event}:${data.id}`;
  return `${event}:${data?.createdAt ?? crypto.randomUUID()}`;
}
