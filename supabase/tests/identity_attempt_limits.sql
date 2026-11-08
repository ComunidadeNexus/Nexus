-- Runs after 20261108120000_identity_digits_and_attempt_limits.sql on the local fixture.

DO $$
DECLARE
  legacy text;
BEGIN
  SELECT cpf_hash || '|' || status
  INTO legacy
  FROM public.identity_verifications
  WHERE user_id = '11111111-1111-4111-8111-111111111111';

  IF legacy IS DISTINCT FROM 'synthetic-legacy-hash|checksum_verified' THEN
    RAISE EXCEPTION 'legacy identity row changed: %', legacy;
  END IF;
END $$;

DO $$
BEGIN
  IF has_function_privilege('public', 'public.begin_identity_attempt(uuid)', 'EXECUTE') THEN
    RAISE EXCEPTION 'public can execute begin_identity_attempt';
  END IF;
  IF has_function_privilege('anon', 'public.begin_identity_attempt(uuid)', 'EXECUTE') THEN
    RAISE EXCEPTION 'anon can execute begin_identity_attempt';
  END IF;
  IF has_function_privilege('authenticated', 'public.begin_identity_attempt(uuid)', 'EXECUTE') THEN
    RAISE EXCEPTION 'authenticated can execute begin_identity_attempt';
  END IF;
  IF NOT has_function_privilege('service_role', 'public.begin_identity_attempt(uuid)', 'EXECUTE') THEN
    RAISE EXCEPTION 'service_role cannot execute begin_identity_attempt';
  END IF;
  IF has_function_privilege('authenticated', 'public.finish_identity_attempt(uuid, text)', 'EXECUTE') THEN
    RAISE EXCEPTION 'authenticated can execute finish_identity_attempt';
  END IF;
  IF has_table_privilege('authenticated', 'public.identity_verification_attempts', 'SELECT') THEN
    RAISE EXCEPTION 'authenticated can read attempt rows';
  END IF;
END $$;

DO $$
DECLARE
  uid uuid := '22222222-2222-4222-8222-222222222222';
  i integer;
  new_id uuid;
  ids uuid[] := ARRAY[]::uuid[];
  attempt_count integer;
BEGIN
  INSERT INTO auth.users (id) VALUES (uid);

  FOR i IN 1..5 LOOP
    new_id := public.begin_identity_attempt(uid);
    IF new_id IS NULL THEN
      RAISE EXCEPTION 'attempt % was limited too early', i;
    END IF;
    ids := ids || new_id;
  END LOOP;

  IF public.begin_identity_attempt(uid) IS NOT NULL THEN
    RAISE EXCEPTION 'sixth hourly attempt was allowed';
  END IF;

  SELECT count(*) INTO attempt_count
  FROM public.identity_verification_attempts
  WHERE user_id = uid;

  IF attempt_count <> 5 THEN
    RAISE EXCEPTION 'a rejected limit check inserted an extra row: %', attempt_count;
  END IF;

  UPDATE public.identity_verification_attempts
  SET created_at = now() - interval '2 hours'
  WHERE id = ids[1];

  new_id := public.begin_identity_attempt(uid);
  IF new_id IS NULL THEN
    RAISE EXCEPTION 'aging one row out of the hour did not release a slot';
  END IF;

  PERFORM public.finish_identity_attempt(new_id, 'accepted');
  IF (SELECT result FROM public.identity_verification_attempts WHERE id = new_id) <> 'accepted' THEN
    RAISE EXCEPTION 'finish did not mark the attempt accepted';
  END IF;

  PERFORM public.finish_identity_attempt(NULL, 'accepted');
END $$;

DO $$
DECLARE
  uid uuid := '33333333-3333-4333-8333-333333333333';
  i integer;
  new_id uuid;
BEGIN
  INSERT INTO auth.users (id) VALUES (uid);

  FOR i IN 1..20 LOOP
    INSERT INTO public.identity_verification_attempts (user_id, result, created_at)
    VALUES (uid, 'rejected', now() - interval '2 hours');
  END LOOP;

  IF public.begin_identity_attempt(uid) IS NOT NULL THEN
    RAISE EXCEPTION 'day limit allowed another attempt';
  END IF;

  UPDATE public.identity_verification_attempts
  SET created_at = now() - interval '2 days'
  WHERE user_id = uid;

  new_id := public.begin_identity_attempt(uid);
  IF new_id IS NULL THEN
    RAISE EXCEPTION 'aging rows out of the day did not release the limit';
  END IF;

  BEGIN
    PERFORM public.finish_identity_attempt(new_id, 'nope');
    RAISE EXCEPTION 'invalid finish result was accepted';
  EXCEPTION
    WHEN SQLSTATE '22023' THEN
      NULL;
  END;
END $$;

DO $$
BEGIN
  INSERT INTO public.identity_verifications (user_id, cpf_hash, cpf_last4, status)
  VALUES (
    '22222222-2222-4222-8222-222222222222',
    'synthetic-new-hash',
    '0000',
    'digits_checked'
  );

  IF (
    SELECT cpf_hash || '|' || status
    FROM public.identity_verifications
    WHERE user_id = '11111111-1111-4111-8111-111111111111'
  ) IS DISTINCT FROM 'synthetic-legacy-hash|checksum_verified' THEN
    RAISE EXCEPTION 'inserting a new status rewrote the legacy row';
  END IF;
END $$;
