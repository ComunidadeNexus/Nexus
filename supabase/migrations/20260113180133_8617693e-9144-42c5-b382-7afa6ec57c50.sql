-- Add upvote/downvote support to posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS upvotes integer NOT NULL DEFAULT 0;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS downvotes integer NOT NULL DEFAULT 0;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS score integer NOT NULL DEFAULT 0;

-- Add karma to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS karma integer NOT NULL DEFAULT 0;

-- Create function to update post score and user karma on vote
CREATE OR REPLACE FUNCTION public.handle_vote_change()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id uuid;
  old_vote_value integer := 0;
  new_vote_value integer := 0;
BEGIN
  -- Get the post author
  SELECT user_id INTO post_author_id FROM public.posts WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  
  -- Calculate old vote value
  IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    IF OLD.reaction_type = 'upvote' THEN
      old_vote_value := 1;
    ELSIF OLD.reaction_type = 'downvote' THEN
      old_vote_value := -1;
    END IF;
  END IF;
  
  -- Calculate new vote value
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.reaction_type = 'upvote' THEN
      new_vote_value := 1;
    ELSIF NEW.reaction_type = 'downvote' THEN
      new_vote_value := -1;
    END IF;
  END IF;
  
  -- Update post counts and score
  IF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET
      upvotes = CASE WHEN OLD.reaction_type = 'upvote' THEN upvotes - 1 ELSE upvotes END,
      downvotes = CASE WHEN OLD.reaction_type = 'downvote' THEN downvotes - 1 ELSE downvotes END,
      score = score - old_vote_value,
      likes_count = CASE WHEN OLD.reaction_type = 'like' THEN likes_count - 1 ELSE likes_count END
    WHERE id = OLD.post_id;
    
    -- Update author karma
    IF post_author_id IS NOT NULL THEN
      UPDATE public.profiles SET karma = karma - old_vote_value WHERE user_id = post_author_id;
    END IF;
    
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET
      upvotes = CASE WHEN NEW.reaction_type = 'upvote' THEN upvotes + 1 ELSE upvotes END,
      downvotes = CASE WHEN NEW.reaction_type = 'downvote' THEN downvotes + 1 ELSE downvotes END,
      score = score + new_vote_value,
      likes_count = CASE WHEN NEW.reaction_type = 'like' THEN likes_count + 1 ELSE likes_count END
    WHERE id = NEW.post_id;
    
    -- Update author karma
    IF post_author_id IS NOT NULL THEN
      UPDATE public.profiles SET karma = karma + new_vote_value WHERE user_id = post_author_id;
    END IF;
    
    RETURN NEW;
  ELSE -- UPDATE
    UPDATE public.posts SET
      upvotes = upvotes - CASE WHEN OLD.reaction_type = 'upvote' THEN 1 ELSE 0 END + CASE WHEN NEW.reaction_type = 'upvote' THEN 1 ELSE 0 END,
      downvotes = downvotes - CASE WHEN OLD.reaction_type = 'downvote' THEN 1 ELSE 0 END + CASE WHEN NEW.reaction_type = 'downvote' THEN 1 ELSE 0 END,
      score = score - old_vote_value + new_vote_value,
      likes_count = likes_count - CASE WHEN OLD.reaction_type = 'like' THEN 1 ELSE 0 END + CASE WHEN NEW.reaction_type = 'like' THEN 1 ELSE 0 END
    WHERE id = NEW.post_id;
    
    -- Update author karma
    IF post_author_id IS NOT NULL THEN
      UPDATE public.profiles SET karma = karma - old_vote_value + new_vote_value WHERE user_id = post_author_id;
    END IF;
    
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for vote changes
DROP TRIGGER IF EXISTS on_vote_change ON public.reactions;
CREATE TRIGGER on_vote_change
  AFTER INSERT OR UPDATE OR DELETE ON public.reactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_vote_change();

-- Create function to calculate ranking score for sorting
CREATE OR REPLACE FUNCTION public.calculate_ranking(post_score integer, created_at timestamptz)
RETURNS numeric AS $$
DECLARE
  hours_old numeric;
BEGIN
  hours_old := EXTRACT(EPOCH FROM (now() - created_at)) / 3600.0;
  RETURN post_score::numeric / POWER(hours_old + 2, 1.5);
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public;