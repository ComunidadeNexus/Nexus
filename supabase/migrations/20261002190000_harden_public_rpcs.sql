-- Lock down leftover public RPC and pin trigger helper search_path.

ALTER FUNCTION public.increment_story_views() SET search_path = public;
ALTER FUNCTION public.update_conversation_timestamp() SET search_path = public;

REVOKE ALL ON FUNCTION public.create_notification(uuid, public.notification_type, text, text, uuid, uuid, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_notification(uuid, public.notification_type, text, text, uuid, uuid, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.create_notification(uuid, public.notification_type, text, text, uuid, uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_notification(uuid, public.notification_type, text, text, uuid, uuid, uuid) TO service_role;

REVOKE ALL ON FUNCTION public.create_conversation_with_participants(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_conversation_with_participants(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.create_conversation_with_participants(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_conversation_with_participants(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_type public.notification_type,
  p_title text,
  p_message text DEFAULT NULL,
  p_actor_id uuid DEFAULT NULL,
  p_post_id uuid DEFAULT NULL,
  p_comment_id uuid DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id uuid;
  uid uuid := (SELECT auth.uid());
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated' USING ERRCODE = '42501';
  END IF;

  IF NOT public.has_role(uid, 'admin'::public.app_role)
     AND (p_actor_id IS NULL OR p_actor_id IS DISTINCT FROM uid) THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;

  IF p_actor_id IS NOT NULL AND p_actor_id = p_user_id THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.notifications (user_id, type, title, message, actor_id, post_id, comment_id)
  VALUES (p_user_id, p_type, p_title, p_message, p_actor_id, p_post_id, p_comment_id)
  RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$;
