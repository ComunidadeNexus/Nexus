insert into public.plans (name, description, price_monthly, price_yearly, features, is_active)
select 'Premium',
       'Acesso total à Área Premium (O Cofre)',
       19.90,
       199.00,
       '["Acesso ao Cofre de Downloads","Ferramentas e Scripts exclusivos","Vídeos e Tutoriais restritos","Selo Premium no Perfil","Navegação sem anúncios","Suporte Prioritário"]'::jsonb,
       true
where not exists (
  select 1 from public.plans where lower(name) = 'premium' and is_active = true
);

update public.plans
set is_active = false
where lower(name) <> 'premium';
