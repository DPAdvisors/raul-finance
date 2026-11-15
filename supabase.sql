-- Ejecuta este SQL en Supabase > SQL Editor
create table if not exists public.finance_backups (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.finance_backups enable row level security;
create policy "Users can read own finance backup"
on public.finance_backups for select using (auth.uid() = user_id);
create policy "Users can insert own finance backup"
on public.finance_backups for insert with check (auth.uid() = user_id);
create policy "Users can update own finance backup"
on public.finance_backups for update using (auth.uid() = user_id)
with check (auth.uid() = user_id);
