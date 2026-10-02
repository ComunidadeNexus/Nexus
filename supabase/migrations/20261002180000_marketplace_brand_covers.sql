update public.marketplace_category_items as item
set
  image_url = cover.image_url,
  fit = cover.fit
from (
  values
    ('instagram', '/marketplace/brands/instagram.svg', 'contain'),
    ('tiktok', '/marketplace/brands/tiktok.svg', 'contain'),
    ('youtube', '/marketplace/brands/youtube.svg', 'contain'),
    ('x', '/marketplace/brands/x.svg', 'contain'),
    ('google-play', '/marketplace/brands/google-play.svg', 'contain'),
    ('apple', '/marketplace/brands/apple.svg', 'contain'),
    ('playstation', '/marketplace/brands/playstation.svg', 'contain'),
    ('xbox', '/marketplace/brands/xbox.svg', 'contain'),
    ('nitro', '/marketplace/brands/discord.svg', 'contain'),
    ('servidor', '/marketplace/brands/discord.svg', 'contain'),
    ('boost', '/marketplace/brands/discord.svg', 'contain'),
    ('spotify', '/marketplace/brands/spotify.svg', 'contain'),
    ('netflix', '/marketplace/brands/netflix.svg', 'contain'),
    ('prime', '/marketplace/brands/prime.svg', 'contain'),
    ('crunchyroll', '/marketplace/brands/crunchyroll.svg', 'contain'),
    ('youtube-premium', '/marketplace/brands/youtube.svg', 'contain'),
    ('gmail', '/marketplace/brands/gmail.svg', 'contain'),
    ('outlook', '/marketplace/brands/outlook.svg', 'contain'),
    ('windows', '/marketplace/brands/windows.svg', 'contain'),
    ('office', '/marketplace/brands/office.svg', 'contain'),
    ('adobe', '/marketplace/brands/adobe.svg', 'contain'),
    ('design', '/marketplace/brands/design.jpg', 'cover'),
    ('dev', '/marketplace/brands/dev.jpg', 'cover'),
    ('edicao', '/marketplace/brands/edicao.svg', 'contain'),
    ('tech', '/marketplace/brands/tech.jpg', 'cover'),
    ('games', '/marketplace/brands/games.jpg', 'cover'),
    ('criacao', '/marketplace/brands/criacao.jpg', 'cover')
) as cover(slug, image_url, fit)
where item.slug = cover.slug
  and item.image_url is null;
