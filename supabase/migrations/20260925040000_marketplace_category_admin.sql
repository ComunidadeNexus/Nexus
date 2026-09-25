-- Admin-managed marketplace catalog (categories + tiles) with public reads.

create table if not exists public.marketplace_categories (
  id bigint generated always as identity primary key,
  slug text not null,
  label text not null,
  icon text not null default 'Sparkles',
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint marketplace_categories_slug_unique unique (slug),
  constraint marketplace_categories_slug_format
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint marketplace_categories_label_not_blank
    check (char_length(trim(label)) > 0)
);

create table if not exists public.marketplace_category_items (
  id bigint generated always as identity primary key,
  category_id bigint not null references public.marketplace_categories (id) on delete cascade,
  slug text not null,
  label text not null,
  image_url text,
  accent text not null default 'from-[#111] to-[#00C6FF]',
  fit text not null default 'cover',
  popular_order integer,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint marketplace_category_items_unique unique (category_id, slug),
  constraint marketplace_category_items_slug_format
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint marketplace_category_items_label_not_blank
    check (char_length(trim(label)) > 0),
  constraint marketplace_category_items_fit_check
    check (fit in ('cover', 'contain'))
);

create index if not exists marketplace_categories_active_sort_idx
  on public.marketplace_categories (is_active, sort_order);

create index if not exists marketplace_category_items_category_id_idx
  on public.marketplace_category_items (category_id);

create index if not exists marketplace_category_items_active_sort_idx
  on public.marketplace_category_items (category_id, is_active, sort_order);

drop trigger if exists marketplace_categories_updated_at on public.marketplace_categories;
create trigger marketplace_categories_updated_at
before update on public.marketplace_categories
for each row execute function public.update_updated_at_column();

drop trigger if exists marketplace_category_items_updated_at on public.marketplace_category_items;
create trigger marketplace_category_items_updated_at
before update on public.marketplace_category_items
for each row execute function public.update_updated_at_column();

alter table public.marketplace_categories enable row level security;
alter table public.marketplace_category_items enable row level security;

grant select on table public.marketplace_categories to anon, authenticated;
grant insert, update, delete on table public.marketplace_categories to authenticated;
grant select on table public.marketplace_category_items to anon, authenticated;
grant insert, update, delete on table public.marketplace_category_items to authenticated;
grant usage, select on sequence public.marketplace_categories_id_seq to authenticated;
grant usage, select on sequence public.marketplace_category_items_id_seq to authenticated;

drop policy if exists marketplace_categories_select_active on public.marketplace_categories;
create policy marketplace_categories_select_active
  on public.marketplace_categories
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists marketplace_categories_admin_all on public.marketplace_categories;
create policy marketplace_categories_admin_all
  on public.marketplace_categories
  for all
  to authenticated
  using ((select public.has_role((select auth.uid()), 'admin'::public.app_role)))
  with check ((select public.has_role((select auth.uid()), 'admin'::public.app_role)));

drop policy if exists marketplace_category_items_select_active on public.marketplace_category_items;
create policy marketplace_category_items_select_active
  on public.marketplace_category_items
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists marketplace_category_items_admin_all on public.marketplace_category_items;
create policy marketplace_category_items_admin_all
  on public.marketplace_category_items
  for all
  to authenticated
  using ((select public.has_role((select auth.uid()), 'admin'::public.app_role)))
  with check ((select public.has_role((select auth.uid()), 'admin'::public.app_role)));

insert into public.marketplace_categories (slug, label, icon, sort_order)
values
  ('jogos', 'Jogos', 'Gamepad2', 1),
  ('redes-sociais', 'Redes Sociais', 'Share2', 2),
  ('gift-cards', 'Gift Cards', 'Gift', 3),
  ('discord', 'Discord', 'MessageSquare', 4),
  ('assinaturas', 'Assinaturas e Premium', 'Crown', 5),
  ('emails', 'Emails', 'Mail', 6),
  ('licencas', 'Licenças e Softwares', 'Monitor', 7),
  ('servicos-digitais', 'Serviços Digitais', 'Sparkles', 8),
  ('cursos', 'Cursos e Treinamentos', 'GraduationCap', 9)
on conflict (slug) do nothing;

insert into public.marketplace_category_items (
  category_id, slug, label, image_url, accent, fit, popular_order, sort_order
)
select c.id, v.slug, v.label, v.image_url, v.accent, v.fit, v.popular_order, v.sort_order
from (
  values
  ('jogos', 'albion', 'Albion Online', '/marketplace/games/albion.jpg', 'from-[#1a2a12] to-[#6b8f3a]', 'cover', 1, 1),
  ('jogos', 'clash-of-clans', 'Clash Of Clans', '/marketplace/games/clash-of-clans.jpg', 'from-[#1a3d0a] to-[#7ac142]', 'contain', 2, 2),
  ('jogos', 'diablo-iv', 'Diablo IV', '/marketplace/games/diablo-iv.jpg', 'from-[#1a0505] to-[#7a1515]', 'cover', 3, 3),
  ('jogos', 'arc-raiders', 'Arc Raiders', '/marketplace/games/arc-raiders.jpg', 'from-[#2a1808] to-[#c45a12]', 'cover', 4, 4),
  ('jogos', 'poe2', 'Path of Exile 2', '/marketplace/games/poe2.jpg', 'from-[#140808] to-[#6b1d1d]', 'cover', 5, 5),
  ('jogos', 'minecraft', 'Minecraft', '/marketplace/games/minecraft.jpg', 'from-[#3b6d2a] to-[#5d9c41]', 'cover', 6, 6),
  ('jogos', 'poe', 'Path Of Exile', '/marketplace/games/poe.jpg', 'from-[#1b1208] to-[#8a6a2a]', 'cover', 7, 7),
  ('jogos', 'roblox', 'Roblox', '/marketplace/games/roblox.svg', 'from-[#111] to-[#e2231a]', 'contain', 8, 8),
  ('jogos', 'steam', 'STEAM', '/marketplace/games/steam.svg', 'from-[#0b1c2d] to-[#1b2838]', 'contain', 9, 9),
  ('jogos', 'valorant', 'Valorant', '/marketplace/games/valorant.jpg', 'from-[#0f1923] to-[#ff4655]', 'cover', 10, 10),
  ('jogos', 'lol', 'League of Legends', '/marketplace/games/lol.png', 'from-[#091428] to-[#c8aa6e]', 'contain', 11, 11),
  ('jogos', 'fortnite', 'Fortnite', '/marketplace/games/fortnite.svg', 'from-[#0b1030] to-[#5b4dff]', 'contain', 12, 12),
  ('jogos', 'cs2', 'Counter-Strike 2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/capsule_616x353.jpg', 'from-[#111] to-[#de9b35]', 'cover', null, 13),
  ('jogos', 'gta-v', 'Grand Theft Auto V', 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/capsule_616x353.jpg', 'from-[#102010] to-[#4aa03a]', 'cover', null, 14),
  ('jogos', 'dota-2', 'Dota 2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/570/capsule_616x353.jpg', 'from-[#111] to-[#c23c2a]', 'cover', null, 15),
  ('jogos', 'apex', 'Apex Legends', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1172470/capsule_616x353.jpg', 'from-[#111] to-[#da292a]', 'cover', null, 16),
  ('jogos', 'elden-ring', 'Elden Ring', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/capsule_616x353.jpg', 'from-[#1a1408] to-[#c9a227]', 'cover', null, 17),
  ('jogos', 'bg3', 'Baldur''s Gate 3', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/capsule_616x353.jpg', 'from-[#1a1008] to-[#8a5a20]', 'cover', null, 18),
  ('jogos', 'palworld', 'Palworld', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1623730/capsule_616x353.jpg', 'from-[#0a2030] to-[#3db7e4]', 'cover', null, 19),
  ('jogos', 'rust', 'Rust', 'https://cdn.cloudflare.steamstatic.com/steam/apps/252490/capsule_616x353.jpg', 'from-[#2a1a10] to-[#8b4513]', 'cover', null, 20),
  ('jogos', 'pubg', 'PUBG', 'https://cdn.cloudflare.steamstatic.com/steam/apps/578080/capsule_616x353.jpg', 'from-[#1a1a12] to-[#c4a35a]', 'cover', null, 21),
  ('jogos', 'the-finals', 'THE FINALS', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2073850/capsule_616x353.jpg', 'from-[#111] to-[#ef4444]', 'cover', null, 22),
  ('jogos', 'cyberpunk', 'Cyberpunk 2077', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/capsule_616x353.jpg', 'from-[#111] to-[#fcee0a]', 'cover', null, 23),
  ('jogos', 'rdr2', 'Red Dead Redemption 2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/capsule_616x353.jpg', 'from-[#1a0808] to-[#8b1e1e]', 'cover', null, 24),
  ('jogos', 'dbd', 'Dead by Daylight', 'https://cdn.cloudflare.steamstatic.com/steam/apps/381210/capsule_616x353.jpg', 'from-[#111] to-[#a11]', 'cover', null, 25),
  ('jogos', 'warzone', 'Call of Duty', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1938090/capsule_616x353.jpg', 'from-[#111] to-[#4b5563]', 'cover', null, 26),
  ('jogos', 'fc-25', 'EA Sports FC', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2669320/capsule_616x353.jpg', 'from-[#052e16] to-[#16a34a]', 'cover', null, 27),
  ('jogos', 'warframe', 'Warframe', 'https://cdn.cloudflare.steamstatic.com/steam/apps/230410/capsule_616x353.jpg', 'from-[#111] to-[#00C6FF]', 'cover', null, 28),
  ('redes-sociais', 'instagram', 'Instagram', null, 'from-[#f58529] to-[#dd2a7b]', 'cover', null, 1),
  ('redes-sociais', 'tiktok', 'TikTok', null, 'from-[#25f4ee] to-[#fe2c55]', 'cover', null, 2),
  ('redes-sociais', 'youtube', 'YouTube', null, 'from-[#ff0000] to-[#282828]', 'cover', null, 3),
  ('redes-sociais', 'x', 'X / Twitter', null, 'from-[#111] to-[#00C6FF]', 'cover', null, 4),
  ('gift-cards', 'google-play', 'Google Play', null, 'from-[#34a853] to-[#4285f4]', 'cover', null, 1),
  ('gift-cards', 'apple', 'Apple', null, 'from-[#555] to-[#111]', 'cover', null, 2),
  ('gift-cards', 'playstation', 'PlayStation', null, 'from-[#003087] to-[#0070d1]', 'cover', null, 3),
  ('gift-cards', 'xbox', 'Xbox', null, 'from-[#107c10] to-[#0b3d0b]', 'cover', null, 4),
  ('discord', 'nitro', 'Nitro', null, 'from-[#5865f2] to-[#00C6FF]', 'cover', null, 1),
  ('discord', 'servidor', 'Servidor', null, 'from-[#5865f2] to-[#111]', 'cover', null, 2),
  ('discord', 'boost', 'Boost', null, 'from-[#f47fff] to-[#5865f2]', 'cover', null, 3),
  ('assinaturas', 'spotify', 'Spotify', null, 'from-[#1db954] to-[#191414]', 'cover', null, 1),
  ('assinaturas', 'netflix', 'Netflix', null, 'from-[#e50914] to-[#221f1f]', 'cover', null, 2),
  ('assinaturas', 'prime', 'Prime Video', null, 'from-[#00a8e1] to-[#232f3e]', 'cover', null, 3),
  ('assinaturas', 'crunchyroll', 'Crunchyroll', null, 'from-[#f47521] to-[#111]', 'cover', null, 4),
  ('assinaturas', 'youtube-premium', 'YouTube Premium', null, 'from-[#ff0000] to-[#282828]', 'cover', null, 5),
  ('emails', 'gmail', 'Gmail', null, 'from-[#ea4335] to-[#34a853]', 'cover', null, 1),
  ('emails', 'outlook', 'Outlook', null, 'from-[#0078d4] to-[#00C6FF]', 'cover', null, 2),
  ('licencas', 'windows', 'Windows', null, 'from-[#00adef] to-[#0078d7]', 'cover', null, 1),
  ('licencas', 'office', 'Office', null, 'from-[#d83b01] to-[#eb3c00]', 'cover', null, 2),
  ('licencas', 'adobe', 'Adobe', null, 'from-[#ff0000] to-[#111]', 'cover', null, 3),
  ('servicos-digitais', 'design', 'Design', null, 'from-[#00C6FF] to-[#FF007F]', 'cover', null, 1),
  ('servicos-digitais', 'dev', 'Programação', null, 'from-[#00C6FF] to-[#111]', 'cover', null, 2),
  ('servicos-digitais', 'edicao', 'Edição', null, 'from-[#FF007F] to-[#111]', 'cover', null, 3),
  ('cursos', 'tech', 'Tecnologia', null, 'from-[#00C6FF] to-[#111]', 'cover', null, 1),
  ('cursos', 'games', 'Games', null, 'from-[#FF007F] to-[#111]', 'cover', null, 2),
  ('cursos', 'criacao', 'Criação', null, 'from-[#00C6FF] to-[#FF007F]', 'cover', null, 3)
) as v(category_slug, slug, label, image_url, accent, fit, popular_order, sort_order)
join public.marketplace_categories c on c.slug = v.category_slug
on conflict (category_id, slug) do nothing;
