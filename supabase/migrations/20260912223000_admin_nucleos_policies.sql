-- Admin CRUD for nucleos, matching categories / premium_items / plans.
-- Without this, verify/edit/delete in /admin/nucleos silently updates 0 rows
-- when the signed-in admin is not the nucleo owner.

CREATE POLICY "Admins can manage nucleos"
ON public.nucleos
FOR ALL
TO authenticated
USING ((SELECT public.has_role((SELECT auth.uid()), 'admin'::public.app_role)))
WITH CHECK ((SELECT public.has_role((SELECT auth.uid()), 'admin'::public.app_role)));
