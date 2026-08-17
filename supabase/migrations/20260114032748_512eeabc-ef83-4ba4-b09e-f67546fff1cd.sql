
-- ========================================
-- 1. FOLLOWERS SYSTEM
-- ========================================

-- Create followers table
CREATE TABLE public.followers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT followers_no_self_follow CHECK (follower_id != following_id),
  CONSTRAINT followers_unique UNIQUE (follower_id, following_id)
);

-- Add counters to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS followers_count integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count integer NOT NULL DEFAULT 0;

-- Enable RLS on followers
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for followers
CREATE POLICY "Followers are viewable by everyone"
ON public.followers FOR SELECT
USING (true);

CREATE POLICY "Users can follow others"
ON public.followers FOR INSERT
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
ON public.followers FOR DELETE
USING (auth.uid() = follower_id);

-- Trigger to update follower counts
CREATE OR REPLACE FUNCTION public.update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET following_count = following_count + 1 WHERE user_id = NEW.follower_id;
    UPDATE public.profiles SET followers_count = followers_count + 1 WHERE user_id = NEW.following_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET following_count = GREATEST(0, following_count - 1) WHERE user_id = OLD.follower_id;
    UPDATE public.profiles SET followers_count = GREATEST(0, followers_count - 1) WHERE user_id = OLD.following_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_follower_counts_trigger
AFTER INSERT OR DELETE ON public.followers
FOR EACH ROW EXECUTE FUNCTION public.update_follower_counts();

-- ========================================
-- 2. NOTIFICATION TRIGGERS
-- ========================================

-- Trigger for like notifications
CREATE OR REPLACE FUNCTION public.notify_on_like()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id uuid;
  actor_name text;
BEGIN
  SELECT user_id INTO post_author_id FROM public.posts WHERE id = NEW.post_id;
  SELECT name INTO actor_name FROM public.profiles WHERE user_id = NEW.user_id;
  
  PERFORM public.create_notification(
    post_author_id,
    'like'::notification_type,
    'Nova curtida',
    COALESCE(actor_name, 'Alguém') || ' curtiu seu post',
    NEW.user_id,
    NEW.post_id,
    NULL
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER notify_on_like_trigger
AFTER INSERT ON public.reactions
FOR EACH ROW
WHEN (NEW.post_id IS NOT NULL AND NEW.reaction_type = 'like')
EXECUTE FUNCTION public.notify_on_like();

-- Trigger for comment notifications
CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id uuid;
  actor_name text;
BEGIN
  SELECT user_id INTO post_author_id FROM public.posts WHERE id = NEW.post_id;
  SELECT name INTO actor_name FROM public.profiles WHERE user_id = NEW.user_id;
  
  PERFORM public.create_notification(
    post_author_id,
    'comment'::notification_type,
    'Novo comentário',
    COALESCE(actor_name, 'Alguém') || ' comentou no seu post',
    NEW.user_id,
    NEW.post_id,
    NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER notify_on_comment_trigger
AFTER INSERT ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_comment();

-- Trigger for follow notifications
CREATE OR REPLACE FUNCTION public.notify_on_follow()
RETURNS TRIGGER AS $$
DECLARE
  actor_name text;
BEGIN
  SELECT name INTO actor_name FROM public.profiles WHERE user_id = NEW.follower_id;
  
  PERFORM public.create_notification(
    NEW.following_id,
    'follow'::notification_type,
    'Novo seguidor',
    COALESCE(actor_name, 'Alguém') || ' começou a seguir você',
    NEW.follower_id,
    NULL,
    NULL
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER notify_on_follow_trigger
AFTER INSERT ON public.followers
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_follow();

-- Enable realtime for followers
ALTER PUBLICATION supabase_realtime ADD TABLE public.followers;
