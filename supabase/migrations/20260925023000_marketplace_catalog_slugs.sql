-- Relax the old produto/servico/digital check so Nexus catalog slugs can be stored.
-- subcategory holds the tile inside a category (steam, netflix, etc).

ALTER TABLE public.marketplace_listings
  DROP CONSTRAINT IF EXISTS marketplace_listings_category_check;

ALTER TABLE public.marketplace_listings
  ADD COLUMN IF NOT EXISTS subcategory text;

CREATE INDEX IF NOT EXISTS marketplace_listings_subcategory_idx
  ON public.marketplace_listings (subcategory);

UPDATE public.marketplace_listings
SET category = CASE category
  WHEN 'produto' THEN 'servicos-digitais'
  WHEN 'servico' THEN 'servicos-digitais'
  WHEN 'digital' THEN 'gift-cards'
  ELSE category
END
WHERE category IN ('produto', 'servico', 'digital');
