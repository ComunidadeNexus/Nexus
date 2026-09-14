-- Notify the other participant when a direct message is sent.
CREATE OR REPLACE FUNCTION public.notify_on_direct_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recipient_id uuid;
  actor_name text;
  preview text;
BEGIN
  SELECT user_id INTO recipient_id
  FROM public.conversation_participants
  WHERE conversation_id = NEW.conversation_id
    AND user_id IS DISTINCT FROM NEW.sender_id
  LIMIT 1;

  IF recipient_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT name INTO actor_name
  FROM public.profiles
  WHERE user_id = NEW.sender_id;

  preview := left(btrim(COALESCE(NEW.content, '')), 80);
  IF preview = '' THEN
    preview := 'Enviou uma mensagem';
  END IF;

  PERFORM public.create_notification(
    recipient_id,
    'message'::public.notification_type,
    COALESCE(actor_name, 'Alguém') || ' enviou uma mensagem',
    preview,
    NEW.sender_id,
    NULL,
    NULL
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_on_direct_message_trigger ON public.direct_messages;

CREATE TRIGGER notify_on_direct_message_trigger
AFTER INSERT ON public.direct_messages
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_direct_message();

REVOKE ALL ON FUNCTION public.notify_on_direct_message() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.notify_on_direct_message() FROM anon, authenticated;
