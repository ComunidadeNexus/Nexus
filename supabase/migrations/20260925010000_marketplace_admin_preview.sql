-- Preview period: only admins can browse and create marketplace listings.
-- Revert these policies when the storefront opens to the community.

DROP POLICY IF EXISTS "Active listings are viewable by everyone" ON public.marketplace_listings;
DROP POLICY IF EXISTS "Authenticated users can create listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "Admins or owners can view listings during preview" ON public.marketplace_listings;
DROP POLICY IF EXISTS "Admins can create listings during preview" ON public.marketplace_listings;
DROP POLICY IF EXISTS "Admins can update any listing" ON public.marketplace_listings;

CREATE POLICY "Admins or owners can view listings during preview"
ON public.marketplace_listings
FOR SELECT
TO authenticated
USING (
  (select public.has_role((select auth.uid()), 'admin'::public.app_role))
  OR user_id = (select auth.uid())
);

CREATE POLICY "Admins can create listings during preview"
ON public.marketplace_listings
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = (select auth.uid())
  AND (select public.has_role((select auth.uid()), 'admin'::public.app_role))
);

CREATE POLICY "Admins can update any listing"
ON public.marketplace_listings
FOR UPDATE
TO authenticated
USING ((select public.has_role((select auth.uid()), 'admin'::public.app_role)))
WITH CHECK ((select public.has_role((select auth.uid()), 'admin'::public.app_role)));
