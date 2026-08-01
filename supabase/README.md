# BIG Supabase Backend

This folder contains a reconstructed Supabase backend package for the BIG app.

## Files
- `migrations/001_core_schema.sql`
- `migrations/002_rls_storage_realtime.sql`
- `migrations/003_seed.sql`
- `database.types.ts`
- `client.ts`
- `auth.ts`
- `database.ts`
- `storage.ts`
- `.env.local.example`

## Deploy

1. Create a new Supabase project.
2. Copy `.env.local.example` to `.env.local` and fill the values.
3. Run migration files in order with Supabase SQL Editor or the Supabase CLI.
4. Enable Realtime on the tables listed in the migration.
5. Restart the app and verify the frontend loads with live data.

## Supabase CLI commands

```bash
supabase login
supabase link --project-ref <project-ref>
supabase db push
```

If you are using the SQL editor directly, paste the migrations in order and run them.
