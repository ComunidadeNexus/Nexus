-- Admins/moderators could not soft-delete other users' global chat messages.
-- UPDATE was limited to auth.uid() = user_id, so the admin panel failed or
-- reported success with 0 rows.

DROP POLICY IF EXISTS "Chat messages are viewable by authenticated users" ON public.chat_messages;
CREATE POLICY "Chat messages are viewable by authenticated users"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (
  (SELECT auth.uid()) IS NOT NULL
  AND (
    is_deleted = false
    OR (SELECT public.has_role((SELECT auth.uid()), 'admin'::public.app_role))
    OR (SELECT public.has_role((SELECT auth.uid()), 'moderator'::public.app_role))
  )
);

DROP POLICY IF EXISTS "Users can soft delete their own messages" ON public.chat_messages;
CREATE POLICY "Users and staff can moderate chat messages"
ON public.chat_messages
FOR UPDATE
TO authenticated
USING (
  (SELECT auth.uid()) = user_id
  OR (SELECT public.has_role((SELECT auth.uid()), 'admin'::public.app_role))
  OR (SELECT public.has_role((SELECT auth.uid()), 'moderator'::public.app_role))
)
WITH CHECK (
  (SELECT auth.uid()) = user_id
  OR (SELECT public.has_role((SELECT auth.uid()), 'admin'::public.app_role))
  OR (SELECT public.has_role((SELECT auth.uid()), 'moderator'::public.app_role))
);

CREATE OR REPLACE FUNCTION public.moderate_chat_message(p_message_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := (SELECT auth.uid());
  updated_id uuid;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated' USING ERRCODE = '42501';
  END IF;

  IF NOT (
    public.has_role(uid, 'admin'::public.app_role)
    OR public.has_role(uid, 'moderator'::public.app_role)
  ) THEN
    RAISE EXCEPTION 'Sem permissão para moderar o chat.' USING ERRCODE = '42501';
  END IF;

  UPDATE public.chat_messages
  SET is_deleted = true
  WHERE id = p_message_id
    AND is_deleted = false
  RETURNING id INTO updated_id;

  IF updated_id IS NULL THEN
    RAISE EXCEPTION 'Mensagem não encontrada ou já excluída.' USING ERRCODE = 'P0001';
  END IF;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.moderate_chat_message(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.moderate_chat_message(uuid) TO authenticated;
