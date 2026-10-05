-- Supabase default SMTP is not production-ready (rate limits, poor deliverability).
-- Confirm email at signup so login + CPF verification work immediately.
-- Prefer custom SMTP later for password-reset / notifications.

UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, created_at)
WHERE email_confirmed_at IS NULL;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_name text;
  v_username text;
  v_base text;
  v_avatar text;
  v_suffix integer := 0;
  v_explicit text;
BEGIN
  UPDATE auth.users AS u
  SET email_confirmed_at = COALESCE(u.email_confirmed_at, NOW())
  WHERE u.id = NEW.id;

  v_name := coalesce(
    nullif(trim(NEW.raw_user_meta_data->>'name'), ''),
    nullif(trim(NEW.raw_user_meta_data->>'full_name'), ''),
    nullif(split_part(coalesce(NEW.email, ''), '@', 1), ''),
    'membro'
  );

  v_avatar := coalesce(
    nullif(NEW.raw_user_meta_data->>'avatar_url', ''),
    nullif(NEW.raw_user_meta_data->>'picture', '')
  );

  v_explicit := nullif(trim(NEW.raw_user_meta_data->>'username'), '');

  IF v_explicit IS NOT NULL THEN
    v_username := regexp_replace(lower(v_explicit), '[^a-z0-9_]', '', 'g');
    IF length(v_username) < 3 OR length(v_username) > 24 THEN
      RAISE EXCEPTION 'Username inválido.' USING ERRCODE = '23514';
    END IF;
    IF EXISTS (
      SELECT 1 FROM public.profiles p WHERE lower(p.username) = v_username
    ) THEN
      RAISE EXCEPTION 'Este username já está em uso.' USING ERRCODE = '23505';
    END IF;
  ELSE
    v_base := lower(regexp_replace(
      coalesce(
        split_part(coalesce(NEW.email, ''), '@', 1),
        'membro'
      ),
      '[^a-z0-9_]',
      '',
      'g'
    ));
    IF v_base IS NULL OR length(v_base) < 3 THEN
      v_base := 'membro';
    END IF;
    v_username := v_base;
    WHILE EXISTS (
      SELECT 1 FROM public.profiles p WHERE lower(p.username) = v_username
    ) LOOP
      v_suffix := v_suffix + 1;
      v_username := v_base || v_suffix::text;
      IF v_suffix > 1000 THEN
        v_username := 'membro' || substr(replace(NEW.id::text, '-', ''), 1, 10);
        EXIT;
      END IF;
    END LOOP;
  END IF;

  INSERT INTO public.profiles (user_id, name, username, avatar_url)
  VALUES (NEW.id, v_name, v_username, v_avatar);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;
