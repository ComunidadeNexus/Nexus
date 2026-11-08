-- CPF digits registry and durable attempt limits.
--
-- Access impact for review:
-- Existing public.identity_verifications rows are not updated, deleted,
-- reassigned, or rehashed. Do not update, delete, reassign, or rehash them
-- in a follow-up unless that migration is reviewed on its own.
-- Community RLS (posts, comments, messages, and the rest) is unchanged, so
-- this migration does not lock existing accounts out of the community.
-- checksum_verified and bureau_verified stay valid legacy values. Neither
-- proves that the account holder owns the CPF. New registrations use
-- digits_checked, which also does not prove ownership.
-- The app may keep treating those three statuses as "CPF on file" so people
-- who already registered a number are not sent back through the form.
-- Proof of identity stays unavailable until a holder-matching provider
-- contract exists. A registry lookup is not that contract.
--
-- Deployment:
-- Do not set IDENTITY_HMAC_WRITE_MODE in this release. verify-identity
-- computes and stores a CPF hash only when that variable is exactly
-- historical-match-confirmed AND IDENTITY_HMAC_SECRET is the dedicated
-- secret that already produced the stored hashes. Leave the mode unset.
-- Do not copy the service-role key into IDENTITY_HMAC_SECRET or
-- IDENTITY_HMAC_SECRET_PREVIOUS, and do not rotate either secret here.
-- The currently deployed function falls back to the service-role key when
-- the dedicated secret is absent, so a new secret would split uniqueness.
-- This migration does not rehash or update identity rows.
-- With hash writes left off, the function does not call
-- begin_identity_attempt. Apply this migration before any later decision
-- to enable writes.
-- Deploy the function and the frontend together. Frontend-only leaves the
-- old enumerating function in place. Function-only leaves the old UI copy
-- that calls checksum success "identidade verificada".
--
-- Rollback:
-- Redeploy the previous verify-identity function and the previous frontend.
-- Leave identity_verifications rows as they are.
-- The widened status check and the attempt table can stay; they do not
-- grant community access and do not change old rows.
-- Dropping digits_checked from the check is safe only when zero rows use
-- that status. Do not rewrite those rows back to checksum_verified.
-- Attempt history can be dropped without touching CPF records:
--   DROP FUNCTION IF EXISTS public.finish_identity_attempt(uuid, text);
--   DROP FUNCTION IF EXISTS public.begin_identity_attempt(uuid);
--   DROP TABLE IF EXISTS public.identity_verification_attempts;

DO $$
DECLARE
  legacy_check record;
BEGIN
  FOR legacy_check IN
    SELECT con.conname
    FROM pg_constraint AS con
    WHERE con.conrelid = 'public.identity_verifications'::regclass
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) ILIKE '%checksum_verified%'
  LOOP
    EXECUTE format(
      'ALTER TABLE public.identity_verifications DROP CONSTRAINT %I',
      legacy_check.conname
    );
  END LOOP;
END $$;

ALTER TABLE public.identity_verifications
  DROP CONSTRAINT IF EXISTS identity_verifications_status_check;

ALTER TABLE public.identity_verifications
  ADD CONSTRAINT identity_verifications_status_check
  CHECK (status IN ('checksum_verified', 'bureau_verified', 'digits_checked'));

CREATE TABLE IF NOT EXISTS public.identity_verification_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  result text NOT NULL CHECK (result IN ('accepted', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS identity_verification_attempts_user_created_idx
  ON public.identity_verification_attempts (user_id, created_at DESC);

ALTER TABLE public.identity_verification_attempts ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.identity_verification_attempts FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.identity_verification_attempts TO postgres, service_role;

COMMENT ON TABLE public.identity_verification_attempts IS
  'Per-user CPF registration attempts. No CPF, hash, or document is stored. Service role only.';

-- Serializes concurrent attempts for one user. Limits stay in sync with
-- IDENTITY_ATTEMPT_HOUR_LIMIT and IDENTITY_ATTEMPT_DAY_LIMIT.
CREATE OR REPLACE FUNCTION public.begin_identity_attempt(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  hour_count integer;
  day_count integer;
  new_id uuid;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'missing user' USING ERRCODE = '42501';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('identity-attempt:' || p_user_id::text)::bigint);

  SELECT count(*) INTO hour_count
  FROM public.identity_verification_attempts
  WHERE user_id = p_user_id
    AND created_at > now() - interval '1 hour';

  SELECT count(*) INTO day_count
  FROM public.identity_verification_attempts
  WHERE user_id = p_user_id
    AND created_at > now() - interval '1 day';

  IF hour_count >= 5 OR day_count >= 20 THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.identity_verification_attempts (user_id, result)
  VALUES (p_user_id, 'rejected')
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.finish_identity_attempt(p_id uuid, p_result text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_id IS NULL THEN
    RETURN;
  END IF;

  IF p_result IS DISTINCT FROM 'accepted' AND p_result IS DISTINCT FROM 'rejected' THEN
    RAISE EXCEPTION 'invalid result' USING ERRCODE = '22023';
  END IF;

  UPDATE public.identity_verification_attempts
  SET result = p_result
  WHERE id = p_id;
END;
$$;

REVOKE ALL ON FUNCTION public.begin_identity_attempt(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.finish_identity_attempt(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.begin_identity_attempt(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.finish_identity_attempt(uuid, text) TO service_role;
