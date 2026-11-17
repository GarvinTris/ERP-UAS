-- Run AFTER the main ERP schema SQL and AFTER creating/linking the six Auth users.
-- Allows each signed-in user to read only their own ERP profile.
alter table public.erp_users
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null;

drop policy if exists "erp_users_read_own_profile" on public.erp_users;
create policy "erp_users_read_own_profile"
on public.erp_users
for select
to authenticated
using (auth.uid() = auth_user_id);

-- No client-side INSERT/UPDATE/DELETE policy is intentionally provided.
-- Provisioning and role changes must be performed by a trusted admin process.
