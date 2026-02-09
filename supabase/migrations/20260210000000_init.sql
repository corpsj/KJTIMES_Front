-- Create press_releases table
create table if not exists press_releases (
  id uuid default gen_random_uuid() primary key,
  origin_id text unique not null,
  source text not null,
  title text not null,
  content text,
  link text,
  images text[],
  published_at timestamp with time zone default now(),
  status text default 'collected',
  
  -- AI generated columns
  generated_title text,
  generated_content text,
  summary text,
  category text,
  processed_at timestamp with time zone,
  
  created_at timestamp with time zone default now()
);

-- RLS Policy (Service Role Bypass)
alter table press_releases enable row level security;

create policy "Service Role Full Access"
on press_releases
for all
to service_role
using (true)
with check (true);

-- Anon Read Access (Optional, for public viewing if needed)
create policy "Public Read Access"
on press_releases
for select
to anon
using (true);
