
create table if not exists articles (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text,
  summary text,
  category text,
  images text[],
  author text default 'AI Reporter',
  is_published boolean default false,
  received_at timestamp with time zone default now()
);

-- RLS (Service Role Key 사용 시 필요)
alter table articles enable row level security;
create policy "Service Role Full Access" on articles for all to service_role using (true) with check (true);

