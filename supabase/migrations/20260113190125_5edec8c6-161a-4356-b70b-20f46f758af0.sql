-- Create enum for nucleo member roles
CREATE TYPE public.nucleo_role AS ENUM ('owner', 'moderator', 'member');

-- Create nucleos table (subcommunities)
CREATE TABLE public.nucleos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    color TEXT NOT NULL DEFAULT '#8B5CF6',
    is_private BOOLEAN NOT NULL DEFAULT false,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    owner_id UUID NOT NULL,
    members_count INTEGER NOT NULL DEFAULT 0,
    posts_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create nucleo_members table
CREATE TABLE public.nucleo_members (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nucleo_id UUID NOT NULL REFERENCES public.nucleos(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role nucleo_role NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(nucleo_id, user_id)
);

-- Create nucleo_rules table
CREATE TABLE public.nucleo_rules (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nucleo_id UUID NOT NULL REFERENCES public.nucleos(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    order_position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add nucleo_id to posts table
ALTER TABLE public.posts ADD COLUMN nucleo_id UUID REFERENCES public.nucleos(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.nucleos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nucleo_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nucleo_rules ENABLE ROW LEVEL SECURITY;

-- Function to check if user is nucleo member
CREATE OR REPLACE FUNCTION public.is_nucleo_member(_user_id UUID, _nucleo_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.nucleo_members
        WHERE user_id = _user_id AND nucleo_id = _nucleo_id
    )
$$;

-- Function to check if user is nucleo moderator/owner
CREATE OR REPLACE FUNCTION public.is_nucleo_moderator(_user_id UUID, _nucleo_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.nucleo_members
        WHERE user_id = _user_id 
        AND nucleo_id = _nucleo_id
        AND role IN ('owner', 'moderator')
    )
$$;

-- RLS Policies for nucleos
CREATE POLICY "Public nucleos are viewable by everyone"
ON public.nucleos FOR SELECT
USING (is_private = false OR is_nucleo_member(auth.uid(), id));

CREATE POLICY "Authenticated users can create nucleos"
ON public.nucleos FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their nucleos"
ON public.nucleos FOR UPDATE
USING (auth.uid() = owner_id OR is_nucleo_moderator(auth.uid(), id));

CREATE POLICY "Owners can delete their nucleos"
ON public.nucleos FOR DELETE
USING (auth.uid() = owner_id);

-- RLS Policies for nucleo_members
CREATE POLICY "Members are viewable by nucleo members"
ON public.nucleo_members FOR SELECT
USING (is_nucleo_member(auth.uid(), nucleo_id) OR NOT (SELECT is_private FROM nucleos WHERE id = nucleo_id));

CREATE POLICY "Users can join public nucleos"
ON public.nucleo_members FOR INSERT
WITH CHECK (
    auth.uid() = user_id AND 
    (NOT (SELECT is_private FROM nucleos WHERE id = nucleo_id) OR 
     (SELECT owner_id FROM nucleos WHERE id = nucleo_id) = auth.uid())
);

CREATE POLICY "Users can leave nucleos"
ON public.nucleo_members FOR DELETE
USING (auth.uid() = user_id OR is_nucleo_moderator(auth.uid(), nucleo_id));

CREATE POLICY "Moderators can update member roles"
ON public.nucleo_members FOR UPDATE
USING (is_nucleo_moderator(auth.uid(), nucleo_id));

-- RLS Policies for nucleo_rules
CREATE POLICY "Rules are viewable by everyone"
ON public.nucleo_rules FOR SELECT
USING (true);

CREATE POLICY "Moderators can manage rules"
ON public.nucleo_rules FOR ALL
USING (is_nucleo_moderator(auth.uid(), nucleo_id));

-- Function to auto-add owner as member
CREATE OR REPLACE FUNCTION public.add_nucleo_owner_as_member()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.nucleo_members (nucleo_id, user_id, role)
    VALUES (NEW.id, NEW.owner_id, 'owner');
    RETURN NEW;
END;
$$;

-- Trigger to add owner as member
CREATE TRIGGER on_nucleo_created
AFTER INSERT ON public.nucleos
FOR EACH ROW EXECUTE FUNCTION public.add_nucleo_owner_as_member();

-- Function to update members count
CREATE OR REPLACE FUNCTION public.update_nucleo_members_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.nucleos SET members_count = members_count + 1 WHERE id = NEW.nucleo_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.nucleos SET members_count = members_count - 1 WHERE id = OLD.nucleo_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

-- Trigger for members count
CREATE TRIGGER on_nucleo_member_change
AFTER INSERT OR DELETE ON public.nucleo_members
FOR EACH ROW EXECUTE FUNCTION public.update_nucleo_members_count();

-- Create indexes
CREATE INDEX idx_nucleos_slug ON public.nucleos(slug);
CREATE INDEX idx_nucleos_owner ON public.nucleos(owner_id);
CREATE INDEX idx_nucleo_members_user ON public.nucleo_members(user_id);
CREATE INDEX idx_nucleo_members_nucleo ON public.nucleo_members(nucleo_id);
CREATE INDEX idx_posts_nucleo ON public.posts(nucleo_id);