create table if not exists public.premium_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  content_type text not null default 'download',
  category text not null default 'geral',
  file_url text not null,
  thumbnail_url text,
  meta text,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint premium_items_content_type_check
    check (content_type in ('download', 'video')),
  constraint premium_items_title_not_blank
    check (char_length(trim(title)) > 0),
  constraint premium_items_file_url_not_blank
    check (char_length(trim(file_url)) > 0)
);

create index if not exists premium_items_published_created_idx
  on public.premium_items (is_published, created_at desc);

alter table public.premium_items enable row level security;

grant select, insert, update, delete on table public.premium_items to authenticated;

create policy premium_items_select_published
  on public.premium_items
  for select
  to authenticated
  using (
    is_published = true
    and (select public.has_premium_access((select auth.uid())))
  );

create policy premium_items_admin_all
  on public.premium_items
  for all
  to authenticated
  using ((select public.has_role((select auth.uid()), 'admin'::app_role)))
  with check ((select public.has_role((select auth.uid()), 'admin'::app_role)));

do $$
begin
  alter publication supabase_realtime add table public.premium_items;
exception
  when duplicate_object then null;
end $$;
