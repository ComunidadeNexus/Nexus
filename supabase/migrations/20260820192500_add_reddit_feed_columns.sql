-- Adicionando colunas necessárias para o formato "Reddit" no Nexus

-- 1. Adicionando Título e Núcleo na tabela de posts
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS nucleo_id UUID REFERENCES public.nucleos(id) ON DELETE SET NULL;

-- 2. Adicionando colunas para o sistema de Upvote/Downvote (estilo Reddit)
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS upvotes_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS downvotes_count INTEGER NOT NULL DEFAULT 0;

-- 3. Atualizar a tabela de reactions para suportar "upvote" e "downvote"
-- Como reaction_type é um ENUM, precisaremos adicionar os novos valores.
-- O PostgreSQL requer que novos valores de ENUM sejam adicionados fora de transações, ou usando ALTER TYPE diretamente.
ALTER TYPE public.reaction_type ADD VALUE IF NOT EXISTS 'upvote';
ALTER TYPE public.reaction_type ADD VALUE IF NOT EXISTS 'downvote';
