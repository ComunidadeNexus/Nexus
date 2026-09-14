# Supabase

This app uses the hosted project `ltqxjcanrwvfqziwokvx`. Schema changes live in `supabase/migrations/`.

## Apply a new migration

If the dashboard is not already in sync with this repo:

1. Open [Supabase SQL Editor](https://supabase.com/dashboard/project/ltqxjcanrwvfqziwokvx/sql)
2. Paste the contents of the new file under `supabase/migrations/`
3. Run it

Or, with the CLI linked to the project:

```sh
npx supabase db push
```

`npx supabase db push` records the version in `supabase_migrations`. Pasting in the SQL Editor does not. Prefer the CLI when you have it; otherwise run the SQL once and do not re-apply a migration that already succeeded.
