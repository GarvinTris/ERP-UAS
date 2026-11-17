# Rona Karsa ERP — Supabase Auth setup

This setup provisions the six demo accounts in Supabase Auth and links each Auth UUID
to the matching row in `public.erp_users`.

## Important security notes
- Use this only for a demo/test project.
- All six accounts share one temporary password, as requested.
- The script uses the **service_role** key. It must only run locally in a trusted terminal.
- Never put `SUPABASE_SERVICE_ROLE_KEY` in Vite/React code, `VITE_*` variables, GitHub, or Vercel frontend environment variables.
- The script can reset the password of an existing matching Auth user.
- Change the shared password after the demo.

## Prerequisites
1. Run the main `rona_karsa_erp_supabase.sql` in the Supabase SQL Editor first.
2. Confirm `public.erp_users` exists and contains USR-01 through USR-06.
3. In Supabase Dashboard > Project Settings > API, copy:
   - Project URL
   - `service_role` key (keep secret)

## Run locally
From the project root (the folder containing `package.json`):

```bash
npm install @supabase/supabase-js
```

Copy `.env.example` to `.env` in the project root and fill in the three values.
Choose a strong temporary password of at least 12 characters.

Then copy this folder's `scripts/create-demo-users.mjs` into your project at `scripts/create-demo-users.mjs` and run:

```bash
node scripts/create-demo-users.mjs
```

Expected output includes `Created Auth user` (or `Updated Auth user`) and `Linked profile`
for all six email addresses.

## Add the own-profile RLS policy
After provisioning, open Supabase SQL Editor and run `supabase/auth-profile-policy.sql`.
This allows a signed-in user to read only their own `erp_users` profile.

## Demo account emails
- owner@ronakarsa.com
- sales@ronakarsa.com
- warehouse@ronakarsa.com
- finance@ronakarsa.com
- cashier@ronakarsa.com
- procurement@ronakarsa.com

All six use the password assigned in `ERP_DEMO_TEMP_PASSWORD`.

## What this does NOT do yet
This creates real Supabase Auth identities and links profiles. It does not by itself replace
the current mock login in `src/components/auth/LoginPage.tsx`, restore sessions in
`ERPContext.tsx`, or connect ERP module data to Supabase. The frontend Auth integration is
the next required code change. Do not claim the website login is live until that change is
implemented and tested.
