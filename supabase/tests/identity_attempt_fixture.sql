-- Local fixture only. Synthetic ids and a non-CPF hash. No production connection.

CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN;

CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE auth.users (
  id uuid PRIMARY KEY
);

CREATE TABLE public.identity_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  cpf_hash text NOT NULL UNIQUE,
  cpf_last4 text NOT NULL,
  status text NOT NULL CHECK (status IN ('checksum_verified', 'bureau_verified')),
  verified_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO auth.users (id)
VALUES ('11111111-1111-4111-8111-111111111111');

INSERT INTO public.identity_verifications (user_id, cpf_hash, cpf_last4, status)
VALUES (
  '11111111-1111-4111-8111-111111111111',
  'synthetic-legacy-hash',
  '0000',
  'checksum_verified'
);
