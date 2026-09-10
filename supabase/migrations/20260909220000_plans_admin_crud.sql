-- Admins can manage all plans (including inactive). Everyone else only sees active rows.
drop policy if exists "Plans are viewable by everyone" on public.plans;

create policy "plans_select_active"
  on public.plans
  for select
  to anon, authenticated
  using (is_active = true);

create policy "plans_admin_all"
  on public.plans
  for all
  to authenticated
  using ((select public.has_role((select auth.uid()), 'admin'::app_role)))
  with check ((select public.has_role((select auth.uid()), 'admin'::app_role)));

-- For now, only the paid Pro plan is public. Admin can activate another later.
update public.plans
set is_active = false
where name in ('Free', 'Enterprise');

do $$
begin
  alter publication supabase_realtime add table public.plans;
exception
  when duplicate_object then null;
end $$;
