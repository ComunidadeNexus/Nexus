-- Fix: Add notification creation capability via SECURITY DEFINER function
-- This ensures only valid notifications are created through controlled functions

-- Create SECURITY DEFINER function to safely create notifications
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_type notification_type,
  p_title text,
  p_message text DEFAULT NULL,
  p_actor_id uuid DEFAULT NULL,
  p_post_id uuid DEFAULT NULL,
  p_comment_id uuid DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  notification_id uuid;
BEGIN
  -- Don't create notification if user is notifying themselves
  IF p_actor_id IS NOT NULL AND p_actor_id = p_user_id THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.notifications (user_id, type, title, message, actor_id, post_id, comment_id)
  VALUES (p_user_id, p_type, p_title, p_message, p_actor_id, p_post_id, p_comment_id)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_notification TO authenticated;