-- Profile / social v1
-- Adds Instagram-style role categories, https-only social links, and
-- admin-only verification. Follows already exist (unique follower+following,
-- no self-follow). This migration tightens follow RLS and blocks self-verify.
--
-- How to apply (hosted project ltqxjcanrwvfqziwokvx):
--   1. Open Supabase Dashboard → SQL Editor
--   2. Paste this file and run it
--   3. Or: `npx supabase db push` from the repo (linked project)
-- Safe to re-run: uses IF NOT EXISTS / DROP POLICY IF EXISTS / CREATE OR REPLACE.

-- =============================================
-- COLUMNS
-- =============================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS profile_categories text[] NOT NULL DEFAULT '{}'::text[];

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS social_links jsonb NOT NULL DEFAULT '{}'::jsonb;

-- =============================================
-- VALIDATION HELPERS
-- =============================================
CREATE OR REPLACE FUNCTION public.profile_categories_are_valid(cats text[])
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT
    COALESCE(cats, '{}'::text[]) <@ ARRAY[
      'content_creator',
      'musician',
      'developer',
      'designer',
      'entrepreneur',
      'educator',
      'gamer',
      'influencer',
      'other'
    ]::text[]
    AND COALESCE(cardinality(cats), 0) = COALESCE(
      (SELECT COUNT(DISTINCT x) FROM unnest(cats) AS x),
      0
    );
$$;

CREATE OR REPLACE FUNCTION public.social_links_are_valid(links jsonb)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  rec record;
  allowed constant text[] := ARRAY[
    'instagram',
    'twitter',
    'youtube',
    'linkedin',
    'tiktok',
    'website'
  ];
BEGIN
  IF links IS NULL OR jsonb_typeof(links) <> 'object' THEN
    RETURN false;
  END IF;

  FOR rec IN SELECT key, value FROM jsonb_each_text(links)
  LOOP
    IF rec.key IS NULL OR NOT (rec.key = ANY (allowed)) THEN
      RETURN false;
    END IF;
    IF rec.value IS NULL OR btrim(rec.value) = '' THEN
      RETURN false;
    END IF;
    IF rec.value !~* '^https://[a-z0-9]' THEN
      RETURN false;
    END IF;
    IF rec.value ~ '[[:space:]]' THEN
      RETURN false;
    END IF;
  END LOOP;

  RETURN true;
END;
$$;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_profile_categories_valid;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_profile_categories_valid
  CHECK (public.profile_categories_are_valid(profile_categories));

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_social_links_valid;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_social_links_valid
  CHECK (public.social_links_are_valid(social_links));

-- =============================================
-- VERIFICATION: only admins may set/unset is_verified
-- =============================================
CREATE OR REPLACE FUNCTION public.prevent_self_verify()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_verified IS DISTINCT FROM OLD.is_verified THEN
    IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
      RAISE EXCEPTION 'only admins can update is_verified'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_self_verify_trigger ON public.profiles;

CREATE TRIGGER prevent_self_verify_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_self_verify();

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  (SELECT public.has_role((SELECT auth.uid()), 'admin'::public.app_role))
)
WITH CHECK (
  (SELECT public.has_role((SELECT auth.uid()), 'admin'::public.app_role))
);

-- =============================================
-- FOLLOWS: authenticated only, unique pair already exists
-- =============================================
DROP POLICY IF EXISTS "Users can follow others" ON public.followers;
CREATE POLICY "Users can follow others"
ON public.followers
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.uid()) = follower_id
  AND follower_id <> following_id
);

DROP POLICY IF EXISTS "Users can unfollow" ON public.followers;
CREATE POLICY "Users can unfollow"
ON public.followers
FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = follower_id);

REVOKE ALL ON FUNCTION public.prevent_self_verify() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.prevent_self_verify() FROM anon, authenticated;
