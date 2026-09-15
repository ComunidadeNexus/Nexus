-- Owners were able to leave their own nucleos (list card) and then lost the
-- Excluir action, which was keyed off membership role instead of owner_id.
-- Direct DELETE on nucleos also raced with the members_count trigger via CASCADE.

CREATE OR REPLACE FUNCTION public.add_nucleo_owner_as_member()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.nucleo_members (nucleo_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner')
  ON CONFLICT (nucleo_id, user_id) DO UPDATE
    SET role = 'owner'::public.nucleo_role;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_nucleo_members_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.nucleos
    SET members_count = members_count + 1
    WHERE id = NEW.nucleo_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.nucleos
    SET members_count = GREATEST(0, members_count - 1)
    WHERE id = OLD.nucleo_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_own_nucleo(p_nucleo_id uuid)
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

  IF NOT EXISTS (
    SELECT 1
    FROM public.nucleos n
    WHERE n.id = p_nucleo_id
      AND (
        n.owner_id = uid
        OR public.has_role(uid, 'admin'::public.app_role)
      )
  ) THEN
    RAISE EXCEPTION 'Sem permissão para excluir este núcleo.' USING ERRCODE = '42501';
  END IF;

  DELETE FROM public.nucleo_members WHERE nucleo_id = p_nucleo_id;
  DELETE FROM public.nucleo_rules WHERE nucleo_id = p_nucleo_id;
  DELETE FROM public.nucleos WHERE id = p_nucleo_id;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.leave_nucleo(p_nucleo_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := (SELECT auth.uid());
  deleted_id uuid;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated' USING ERRCODE = '42501';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.nucleos n
    WHERE n.id = p_nucleo_id
      AND n.owner_id = uid
  ) THEN
    RAISE EXCEPTION 'O dono precisa excluir a comunidade para sair.' USING ERRCODE = 'P0001';
  END IF;

  DELETE FROM public.nucleo_members
  WHERE nucleo_id = p_nucleo_id
    AND user_id = uid
  RETURNING id INTO deleted_id;

  IF deleted_id IS NULL THEN
    RAISE EXCEPTION 'Você não é membro deste núcleo.' USING ERRCODE = 'P0001';
  END IF;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_own_nucleo(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.leave_nucleo(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.add_nucleo_owner_as_member() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_nucleo_members_count() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_own_nucleo(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.leave_nucleo(uuid) TO authenticated;

DROP POLICY IF EXISTS "Public nucleos are viewable by everyone" ON public.nucleos;
CREATE POLICY "Nucleos are viewable by public members or owners"
ON public.nucleos
FOR SELECT
USING (
  is_private = false
  OR owner_id = (SELECT auth.uid())
  OR is_nucleo_member((SELECT auth.uid()), id)
);

DROP POLICY IF EXISTS "Owners can update their nucleos" ON public.nucleos;
CREATE POLICY "Owners can update their nucleos"
ON public.nucleos
FOR UPDATE
TO authenticated
USING (
  owner_id = (SELECT auth.uid())
  OR is_nucleo_moderator((SELECT auth.uid()), id)
)
WITH CHECK (
  owner_id = (SELECT auth.uid())
  OR is_nucleo_moderator((SELECT auth.uid()), id)
);

DROP POLICY IF EXISTS "Owners can delete their nucleos" ON public.nucleos;
CREATE POLICY "Owners can delete their nucleos"
ON public.nucleos
FOR DELETE
TO authenticated
USING (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Members are viewable by nucleo members" ON public.nucleo_members;
CREATE POLICY "Members are viewable by nucleo members"
ON public.nucleo_members
FOR SELECT
USING (
  is_nucleo_member((SELECT auth.uid()), nucleo_id)
  OR EXISTS (
    SELECT 1
    FROM public.nucleos n
    WHERE n.id = nucleo_members.nucleo_id
      AND (
        n.is_private = false
        OR n.owner_id = (SELECT auth.uid())
      )
  )
);

DROP POLICY IF EXISTS "Users can leave nucleos" ON public.nucleo_members;
CREATE POLICY "Users can leave nucleos"
ON public.nucleo_members
FOR DELETE
TO authenticated
USING (
  (
    (SELECT auth.uid()) = user_id
    AND NOT EXISTS (
      SELECT 1
      FROM public.nucleos n
      WHERE n.id = nucleo_members.nucleo_id
        AND n.owner_id = (SELECT auth.uid())
    )
  )
  OR (
    is_nucleo_moderator((SELECT auth.uid()), nucleo_id)
    AND user_id <> (
      SELECT n.owner_id
      FROM public.nucleos n
      WHERE n.id = nucleo_members.nucleo_id
    )
  )
);

INSERT INTO public.nucleo_members (nucleo_id, user_id, role)
SELECT n.id, n.owner_id, 'owner'::public.nucleo_role
FROM public.nucleos n
ON CONFLICT (nucleo_id, user_id) DO UPDATE
  SET role = 'owner'::public.nucleo_role;

UPDATE public.nucleos n
SET members_count = (
  SELECT count(*)::integer
  FROM public.nucleo_members m
  WHERE m.nucleo_id = n.id
);
