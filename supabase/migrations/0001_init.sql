-- MealMate initial schema.
-- User profile data lives in auth.users.user_metadata for simplicity:
--   { username, dietary[], cuisines[], servings, weeklyBudget, plan }
-- Per-user meal-plan / grocery / favorites are still stored client-side in
-- localStorage keyed by Supabase user.id. Cross-device sync can be added
-- later by introducing meal_plans / grocery_lists / favorites tables and
-- enabling RLS on user_id = auth.uid().

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  plan text,
  created_at timestamptz not null default now()
);

alter table public.waitlist enable row level security;

-- Anyone can insert their email; nobody (except service-role) can read.
drop policy if exists "Anyone can join the waitlist" on public.waitlist;
create policy "Anyone can join the waitlist"
  on public.waitlist
  for insert
  to anon, authenticated
  with check (true);
