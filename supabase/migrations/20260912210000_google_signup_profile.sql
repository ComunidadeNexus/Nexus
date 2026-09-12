-- Google OAuth users have full_name/picture, not username. Create a unique profile.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text;
  v_username text;
  v_base text;
  v_avatar text;
  v_suffix integer := 0;
begin
  v_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'name'), ''),
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'membro'
  );

  v_avatar := coalesce(
    nullif(new.raw_user_meta_data->>'avatar_url', ''),
    nullif(new.raw_user_meta_data->>'picture', '')
  );

  v_base := lower(regexp_replace(
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'username'), ''),
      split_part(coalesce(new.email, ''), '@', 1),
      'membro'
    ),
    '[^a-z0-9_]',
    '',
    'g'
  ));

  if v_base is null or length(v_base) < 3 then
    v_base := 'membro';
  end if;

  v_username := v_base;

  while exists (
    select 1
    from public.profiles as p
    where p.username = v_username
  ) loop
    v_suffix := v_suffix + 1;
    v_username := v_base || v_suffix::text;
    if v_suffix > 1000 then
      v_username := 'membro' || substr(replace(new.id::text, '-', ''), 1, 10);
      exit;
    end if;
  end loop;

  insert into public.profiles (user_id, name, username, avatar_url)
  values (new.id, v_name, v_username, v_avatar);

  insert into public.user_roles (user_id, role)
  values (new.id, 'user'::public.app_role)
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;
