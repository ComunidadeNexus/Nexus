-- Owner updates must keep the same user_id; only admins change ban.
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE OR REPLACE FUNCTION public.prevent_self_verify()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_verified IS DISTINCT FROM OLD.is_verified
     OR NEW.is_banned IS DISTINCT FROM OLD.is_banned THEN
    IF (SELECT auth.uid()) IS NULL
       OR NOT public.has_role((SELECT auth.uid()), 'admin'::public.app_role) THEN
      RAISE EXCEPTION 'only admins can update is_verified or is_banned'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
