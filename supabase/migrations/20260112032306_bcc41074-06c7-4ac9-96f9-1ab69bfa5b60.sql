-- Create categories table
CREATE TABLE public.categories (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT NOT NULL DEFAULT 'folder',
    color TEXT NOT NULL DEFAULT '#8B5CF6',
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    order_position INTEGER NOT NULL DEFAULT 0,
    is_admin_only BOOLEAN NOT NULL DEFAULT false,
    is_premium_only BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add category_id to posts table
ALTER TABLE public.posts ADD COLUMN category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- Enable RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Categories viewable by everyone (active ones, respecting premium)
CREATE POLICY "Categories are viewable by everyone"
ON public.categories
FOR SELECT
USING (
    is_active = true 
    AND (is_premium_only = false OR has_premium_access(auth.uid()))
);

-- Only admins can manage categories
CREATE POLICY "Admins can manage categories"
ON public.categories
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial categories
INSERT INTO public.categories (name, slug, description, icon, color, order_position, is_admin_only, is_premium_only) VALUES
('Boas-vindas & Regras', 'boas-vindas', 'Regras da comunidade e orientações para novos membros', 'book-open', '#10B981', 1, true, false),
('Anúncios Oficiais', 'anuncios', 'Comunicados oficiais da plataforma', 'megaphone', '#F59E0B', 2, true, false),
('Discussões Gerais', 'discussoes', 'Conversas abertas sobre qualquer tema', 'message-circle', '#6366F1', 3, false, false),
('Dúvidas & Suporte', 'duvidas', 'Tire suas dúvidas e receba ajuda da comunidade', 'help-circle', '#3B82F6', 4, false, false),
('Conteúdo Educacional', 'educacional', 'Artigos, tutoriais e materiais de estudo', 'graduation-cap', '#8B5CF6', 5, true, false),
('Projetos & Cases', 'projetos', 'Compartilhe seus projetos e receba feedback', 'folder-kanban', '#EC4899', 6, false, false),
('Desafios & Ranking', 'desafios', 'Participe de desafios e suba no ranking', 'trophy', '#EAB308', 7, true, false),
('Oportunidades', 'oportunidades', 'Vagas, freelances e parcerias', 'briefcase', '#14B8A6', 8, false, false),
('Eventos & Lives', 'eventos', 'Calendário de eventos e transmissões ao vivo', 'calendar', '#F97316', 9, true, false),
('Área Premium', 'premium', 'Conteúdo exclusivo para membros premium', 'crown', '#FFD700', 10, false, true),
('Feedback & Sugestões', 'feedback', 'Sugira melhorias para a plataforma', 'message-square-plus', '#22C55E', 11, false, false),
('Off-topic', 'off-topic', 'Conversas descontraídas e aleatórias', 'coffee', '#A855F7', 12, false, false);