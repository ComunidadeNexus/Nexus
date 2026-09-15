-- Unique usernames (case-insensitive), identity verification table,
-- and wallet lockdown before real money.

-- 1) Username uniqueness
UPDATE public.profiles p
SET username = left(lower(coalesce(p.username, 'membro')), 20)
  || '_'
  || substr(replace(p.user_id::text, '-', ''), 1, 6)
WHERE p.username IS NOT NULL
  AND p.user_id <> (
    SELECT p2.user_id
    FROM public.profiles p2
    WHERE p2.username IS NOT NULL
      AND lower(p2.username) = lower(p.username)
    ORDER BY p2.created_at ASC
    LIMIT 1
  );

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_username_key;
DROP INDEX IF EXISTS profiles_username_key;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_key
  ON public.profiles (lower(username))
  WHERE username IS NOT NULL;

CREATE OR REPLACE FUNCTION public.is_username_available(p_username text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    length(regexp_replace(lower(trim(coalesce(p_username, ''))), '[^a-z0-9_]', '', 'g')) >= 3
    AND NOT EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE lower(p.username) = regexp_replace(lower(trim(p_username)), '[^a-z0-9_]', '', 'g')
    );
$$;

REVOKE ALL ON FUNCTION public.is_username_available(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_username_available(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name text;
  v_username text;
  v_base text;
  v_avatar text;
  v_suffix integer := 0;
  v_explicit text;
BEGIN
  v_name := coalesce(
    nullif(trim(NEW.raw_user_meta_data->>'name'), ''),
    nullif(trim(NEW.raw_user_meta_data->>'full_name'), ''),
    nullif(split_part(coalesce(NEW.email, ''), '@', 1), ''),
    'membro'
  );

  v_avatar := coalesce(
    nullif(NEW.raw_user_meta_data->>'avatar_url', ''),
    nullif(NEW.raw_user_meta_data->>'picture', '')
  );

  v_explicit := nullif(trim(NEW.raw_user_meta_data->>'username'), '');

  IF v_explicit IS NOT NULL THEN
    v_username := regexp_replace(lower(v_explicit), '[^a-z0-9_]', '', 'g');
    IF length(v_username) < 3 OR length(v_username) > 24 THEN
      RAISE EXCEPTION 'Username inválido.' USING ERRCODE = '23514';
    END IF;
    IF EXISTS (
      SELECT 1 FROM public.profiles p WHERE lower(p.username) = v_username
    ) THEN
      RAISE EXCEPTION 'Este username já está em uso.' USING ERRCODE = '23505';
    END IF;
  ELSE
    v_base := lower(regexp_replace(
      coalesce(
        split_part(coalesce(NEW.email, ''), '@', 1),
        'membro'
      ),
      '[^a-z0-9_]',
      '',
      'g'
    ));
    IF v_base IS NULL OR length(v_base) < 3 THEN
      v_base := 'membro';
    END IF;
    v_username := v_base;
    WHILE EXISTS (
      SELECT 1 FROM public.profiles p WHERE lower(p.username) = v_username
    ) LOOP
      v_suffix := v_suffix + 1;
      v_username := v_base || v_suffix::text;
      IF v_suffix > 1000 THEN
        v_username := 'membro' || substr(replace(NEW.id::text, '-', ''), 1, 10);
        EXIT;
      END IF;
    END LOOP;
  END IF;

  INSERT INTO public.profiles (user_id, name, username, avatar_url)
  VALUES (NEW.id, v_name, v_username, v_avatar);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 2) Identity
CREATE TABLE IF NOT EXISTS public.identity_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  cpf_hash text NOT NULL UNIQUE,
  cpf_last4 text NOT NULL,
  status text NOT NULL CHECK (status IN ('checksum_verified', 'bureau_verified')),
  verified_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS identity_verifications_user_id_idx
  ON public.identity_verifications (user_id);

ALTER TABLE public.identity_verifications ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.identity_verifications FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.identity_verifications TO postgres, service_role;
GRANT SELECT (id, user_id, cpf_last4, status, verified_at, created_at) ON public.identity_verifications TO authenticated;

CREATE POLICY "Users can view own identity status"
ON public.identity_verifications
FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Admins can view identity status"
ON public.identity_verifications
FOR SELECT
TO authenticated
USING ((SELECT public.has_role((SELECT auth.uid()), 'admin'::public.app_role)));

-- 3) Wallet lockdown
DROP POLICY IF EXISTS "Users can create their own wallet" ON public.user_wallets;
DROP POLICY IF EXISTS "Users can update their own wallet" ON public.user_wallets;
DROP POLICY IF EXISTS "Users can create their own transactions" ON public.coin_transactions;
DROP POLICY IF EXISTS "Users can create non-purchase transactions" ON public.coin_transactions;

DROP POLICY IF EXISTS "Admins can view all wallets" ON public.user_wallets;
CREATE POLICY "Admins can view all wallets"
ON public.user_wallets
FOR SELECT
TO authenticated
USING ((SELECT public.has_role((SELECT auth.uid()), 'admin'::public.app_role)));

DROP POLICY IF EXISTS "Admins can view all coin transactions" ON public.coin_transactions;
CREATE POLICY "Admins can view all coin transactions"
ON public.coin_transactions
FOR SELECT
TO authenticated
USING ((SELECT public.has_role((SELECT auth.uid()), 'admin'::public.app_role)));

ALTER TABLE public.coin_transactions DROP CONSTRAINT IF EXISTS coin_transactions_type_check;
ALTER TABLE public.coin_transactions
  ADD CONSTRAINT coin_transactions_type_check
  CHECK (type IN ('purchase', 'reward', 'spend', 'transfer_in', 'transfer_out', 'refund', 'admin_credit'));

CREATE OR REPLACE FUNCTION public.process_coin_transaction(
  p_user_id uuid,
  p_amount integer,
  p_type text,
  p_description text DEFAULT NULL,
  p_reference_id uuid DEFAULT NULL,
  p_reference_type text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance integer;
BEGIN
  SELECT balance INTO current_balance
  FROM public.user_wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF current_balance IS NULL THEN
    INSERT INTO public.user_wallets (user_id, balance) VALUES (p_user_id, 0);
    current_balance := 0;
  END IF;

  IF p_type IN ('spend', 'transfer_out') AND current_balance < p_amount THEN
    RETURN false;
  END IF;

  IF p_type IN ('purchase', 'reward', 'transfer_in', 'refund', 'admin_credit') THEN
    UPDATE public.user_wallets
    SET balance = balance + p_amount,
        total_earned = total_earned + p_amount,
        updated_at = now()
    WHERE user_id = p_user_id;
  ELSE
    UPDATE public.user_wallets
    SET balance = balance - p_amount,
        total_spent = total_spent + p_amount,
        updated_at = now()
    WHERE user_id = p_user_id;
  END IF;

  INSERT INTO public.coin_transactions (user_id, amount, type, description, reference_id, reference_type)
  VALUES (p_user_id, p_amount, p_type, p_description, p_reference_id, p_reference_type);

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.spend_own_coins(
  p_amount integer,
  p_description text DEFAULT NULL,
  p_reference_id uuid DEFAULT NULL,
  p_reference_type text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := (SELECT auth.uid());
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated' USING ERRCODE = '42501';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Valor inválido.' USING ERRCODE = '22023';
  END IF;
  RETURN public.process_coin_transaction(uid, p_amount, 'spend', p_description, p_reference_id, p_reference_type);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_credit_coins(
  p_user_id uuid,
  p_amount integer,
  p_description text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := (SELECT auth.uid());
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated' USING ERRCODE = '42501';
  END IF;
  IF NOT public.has_role(uid, 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Sem permissão.' USING ERRCODE = '42501';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Valor inválido.' USING ERRCODE = '22023';
  END IF;
  RETURN public.process_coin_transaction(
    p_user_id,
    p_amount,
    'admin_credit',
    coalesce(p_description, 'Crédito manual pelo administrador')
  );
END;
$$;

REVOKE ALL ON FUNCTION public.process_coin_transaction(uuid, integer, text, text, uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_coin_transaction(uuid, integer, text, text, uuid, text) TO service_role;

REVOKE ALL ON FUNCTION public.spend_own_coins(integer, text, uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.spend_own_coins(integer, text, uuid, text) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_credit_coins(uuid, integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_credit_coins(uuid, integer, text) TO authenticated;

DO $$
DECLARE
  fn record;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'handle_new_user',
        'initialize_user_wallet',
        'handle_vote_change',
        'increment_story_views',
        'update_conversation_timestamp',
        'update_follower_counts',
        'update_post_comments_count',
        'update_post_likes_count',
        'notify_on_comment',
        'notify_on_follow',
        'notify_on_like',
        'notify_on_direct_message'
      )
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', fn.sig);
  END LOOP;
END $$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.process_coin_transaction(uuid, integer, text, text, uuid, text) TO service_role;
