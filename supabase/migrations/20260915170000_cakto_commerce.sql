-- Cakto commerce: producers, digital products, orders, webhooks.
-- Does not remove Stripe coins/subscriptions or classified marketplace.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_producer boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS producer_status text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS cakto_account_id text,
  ADD COLUMN IF NOT EXISTS cakto_account_status text,
  ADD COLUMN IF NOT EXISTS cakto_customer_id text;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_producer_status_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_producer_status_check
  CHECK (producer_status IN ('none', 'pending', 'under_review', 'approved', 'rejected', 'suspended'));

ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS cakto_offer_id_monthly text,
  ADD COLUMN IF NOT EXISTS cakto_offer_id_yearly text;

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS provider text NOT NULL DEFAULT 'stripe',
  ADD COLUMN IF NOT EXISTS provider_subscription_id text;

ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_provider_check;
ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_provider_check
  CHECK (provider IN ('stripe', 'cakto'));

CREATE TABLE IF NOT EXISTS public.producer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  producer_type text NOT NULL CHECK (producer_type IN ('individual', 'company')),
  full_name text NOT NULL,
  business_name text,
  tax_id_type text NOT NULL CHECK (tax_id_type IN ('cpf', 'cnpj')),
  tax_id_hash text NOT NULL,
  tax_id_last4 text NOT NULL,
  birth_date date,
  phone text,
  email text NOT NULL,
  address text,
  city text,
  state text,
  postal_code text,
  pix_key text,
  bank_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  document_status text NOT NULL DEFAULT 'pending',
  kyc_status text NOT NULL DEFAULT 'pending',
  cakto_account_id text,
  cakto_account_status text,
  terms_accepted_at timestamptz,
  review_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT producer_profiles_tax_pair CHECK (
    (producer_type = 'individual' AND tax_id_type = 'cpf')
    OR (producer_type = 'company' AND tax_id_type = 'cnpj')
  )
);

CREATE INDEX IF NOT EXISTS producer_profiles_user_id_idx ON public.producer_profiles (user_id);

CREATE TABLE IF NOT EXISTS public.producer_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric(12, 2) NOT NULL CHECK (price >= 0),
  currency text NOT NULL DEFAULT 'BRL',
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending', 'active', 'paused', 'rejected')),
  cakto_product_id text,
  cakto_offer_id text,
  checkout_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS producer_products_producer_id_idx ON public.producer_products (producer_id);
CREATE INDEX IF NOT EXISTS producer_products_status_idx ON public.producer_products (status);
CREATE INDEX IF NOT EXISTS producer_products_offer_idx ON public.producer_products (cakto_offer_id);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  seller_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id uuid REFERENCES public.producer_products(id) ON DELETE SET NULL,
  plan_id uuid REFERENCES public.plans(id) ON DELETE SET NULL,
  amount numeric(12, 2) NOT NULL CHECK (amount >= 0),
  currency text NOT NULL DEFAULT 'BRL',
  payment_status text NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'chargeback', 'canceled')),
  payment_provider text NOT NULL DEFAULT 'cakto' CHECK (payment_provider IN ('cakto')),
  provider_transaction_id text,
  provider_offer_id text,
  provider_subscription_id text,
  checkout_url text,
  buyer_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_buyer_id_idx ON public.orders (buyer_id);
CREATE INDEX IF NOT EXISTS orders_seller_id_idx ON public.orders (seller_id);
CREATE INDEX IF NOT EXISTS orders_product_id_idx ON public.orders (product_id);
CREATE UNIQUE INDEX IF NOT EXISTS orders_provider_tx_key
  ON public.orders (payment_provider, provider_transaction_id)
  WHERE provider_transaction_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.payment_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  event_id text NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  processed boolean NOT NULL DEFAULT false,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, event_id)
);

CREATE INDEX IF NOT EXISTS payment_webhook_events_type_idx
  ON public.payment_webhook_events (provider, event_type, created_at DESC);

CREATE TABLE IF NOT EXISTS public.producer_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  gross_amount numeric(12, 2) NOT NULL DEFAULT 0,
  gateway_fee numeric(12, 2) NOT NULL DEFAULT 0,
  platform_fee numeric(12, 2) NOT NULL DEFAULT 0,
  producer_amount numeric(12, 2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  provider_transaction_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS producer_transactions_producer_id_idx
  ON public.producer_transactions (producer_id);
CREATE UNIQUE INDEX IF NOT EXISTS producer_transactions_provider_tx_key
  ON public.producer_transactions (provider_transaction_id)
  WHERE provider_transaction_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.product_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.producer_products(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS product_entitlements_user_id_idx ON public.product_entitlements (user_id);

INSERT INTO public.system_settings (key, value)
SELECT 'platform_fee_percentage', '10'::jsonb
WHERE EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'system_settings'
)
AND NOT EXISTS (
  SELECT 1 FROM public.system_settings WHERE key = 'platform_fee_percentage'
);

CREATE OR REPLACE FUNCTION public.is_approved_producer(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = _user_id
      AND p.is_producer = true
      AND p.producer_status = 'approved'
  );
$$;

REVOKE ALL ON FUNCTION public.is_approved_producer(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_approved_producer(uuid) TO authenticated, service_role;

ALTER TABLE public.producer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producer_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producer_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_entitlements ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.payment_webhook_events FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.payment_webhook_events TO postgres, service_role;
GRANT SELECT ON public.payment_webhook_events TO authenticated;

GRANT SELECT, INSERT, UPDATE ON public.producer_products TO authenticated;
GRANT SELECT ON public.orders TO authenticated;
GRANT SELECT ON public.producer_transactions TO authenticated;
GRANT SELECT ON public.product_entitlements TO authenticated;
GRANT ALL ON TABLE public.producer_profiles TO postgres, service_role;
GRANT ALL ON TABLE public.orders TO postgres, service_role;
GRANT ALL ON TABLE public.producer_transactions TO postgres, service_role;
GRANT ALL ON TABLE public.product_entitlements TO postgres, service_role;

REVOKE SELECT (tax_id_hash, pix_key, bank_data) ON public.producer_profiles FROM authenticated;
GRANT SELECT (
  id, user_id, producer_type, full_name, business_name, tax_id_type, tax_id_last4,
  birth_date, phone, email, address, city, state, postal_code,
  document_status, kyc_status, cakto_account_id, cakto_account_status,
  terms_accepted_at, created_at, updated_at
) ON public.producer_profiles TO authenticated;

DROP POLICY IF EXISTS "Owner can view producer profile" ON public.producer_profiles;
DROP POLICY IF EXISTS "Admins can update producer profiles" ON public.producer_profiles;
DROP POLICY IF EXISTS "Anyone can view active products" ON public.producer_products;
DROP POLICY IF EXISTS "Approved producer can insert products" ON public.producer_products;
DROP POLICY IF EXISTS "Owner can update own products" ON public.producer_products;
DROP POLICY IF EXISTS "Buyer and seller can view orders" ON public.orders;
DROP POLICY IF EXISTS "Producer can view own transactions" ON public.producer_transactions;
DROP POLICY IF EXISTS "Admins can view webhook events" ON public.payment_webhook_events;
DROP POLICY IF EXISTS "User can view own entitlements" ON public.product_entitlements;

CREATE POLICY "Owner can view producer profile"
ON public.producer_profiles FOR SELECT TO authenticated
USING (user_id = (SELECT auth.uid()) OR (SELECT public.has_role((SELECT auth.uid()), 'admin'::public.app_role)));

CREATE POLICY "Admins can update producer profiles"
ON public.producer_profiles FOR UPDATE TO authenticated
USING ((SELECT public.has_role((SELECT auth.uid()), 'admin'::public.app_role)))
WITH CHECK ((SELECT public.has_role((SELECT auth.uid()), 'admin'::public.app_role)));

CREATE POLICY "Anyone can view active products"
ON public.producer_products FOR SELECT TO authenticated
USING (
  status = 'active'
  OR producer_id = (SELECT auth.uid())
  OR (SELECT public.has_role((SELECT auth.uid()), 'admin'::public.app_role))
);

CREATE POLICY "Approved producer can insert products"
ON public.producer_products FOR INSERT TO authenticated
WITH CHECK (
  producer_id = (SELECT auth.uid())
  AND (SELECT public.is_approved_producer((SELECT auth.uid())))
  AND status IN ('draft', 'pending')
);

CREATE POLICY "Owner can update own products"
ON public.producer_products FOR UPDATE TO authenticated
USING (
  producer_id = (SELECT auth.uid())
  OR (SELECT public.has_role((SELECT auth.uid()), 'admin'::public.app_role))
)
WITH CHECK (
  (SELECT public.has_role((SELECT auth.uid()), 'admin'::public.app_role))
  OR (
    producer_id = (SELECT auth.uid())
    AND (
      status IN ('draft', 'pending', 'paused', 'rejected')
      OR (status = 'active' AND cakto_offer_id IS NOT NULL)
    )
  )
);

CREATE POLICY "Buyer and seller can view orders"
ON public.orders FOR SELECT TO authenticated
USING (
  buyer_id = (SELECT auth.uid())
  OR seller_id = (SELECT auth.uid())
  OR (SELECT public.has_role((SELECT auth.uid()), 'admin'::public.app_role))
);

CREATE POLICY "Producer can view own transactions"
ON public.producer_transactions FOR SELECT TO authenticated
USING (
  producer_id = (SELECT auth.uid())
  OR (SELECT public.has_role((SELECT auth.uid()), 'admin'::public.app_role))
);

CREATE POLICY "Admins can view webhook events"
ON public.payment_webhook_events FOR SELECT TO authenticated
USING ((SELECT public.has_role((SELECT auth.uid()), 'admin'::public.app_role)));

CREATE POLICY "User can view own entitlements"
ON public.product_entitlements FOR SELECT TO authenticated
USING (
  user_id = (SELECT auth.uid())
  OR (SELECT public.has_role((SELECT auth.uid()), 'admin'::public.app_role))
);

GRANT ALL ON TABLE public.producer_products TO postgres, service_role;

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_provider_sub_key
  ON public.subscriptions (provider, provider_subscription_id);

CREATE INDEX IF NOT EXISTS orders_pending_offer_idx
  ON public.orders (provider_offer_id, buyer_email, created_at)
  WHERE payment_status = 'pending';

CREATE UNIQUE INDEX IF NOT EXISTS producer_transactions_order_id_key
  ON public.producer_transactions (order_id)
  WHERE order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS profiles_producer_status_idx
  ON public.profiles (producer_status)
  WHERE producer_status <> 'none';

