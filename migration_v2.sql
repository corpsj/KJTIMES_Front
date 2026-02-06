-- Migration Script for Media CMS Upgrade
-- Run this script to upgrade your existing database without deleting data.

-- 1. Create new tables if they don't exist
create table if not exists tags (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  created_at timestamptz default now()
);

create table if not exists media (
  id uuid default uuid_generate_v4() primary key,
  filename text not null,
  url text not null,
  type text not null, -- 'image', 'video'
  alt_text text,
  caption text,
  file_size integer,
  dimensions jsonb,
  uploaded_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- 2. Update ARTICLES table with new columns
alter table articles add column if not exists slug text unique;
alter table articles add column if not exists excerpt text;
alter table articles add column if not exists seo_title text;
alter table articles add column if not exists seo_description text;
alter table articles add column if not exists keywords text;
alter table articles add column if not exists published_at timestamptz;

-- 3. Update ARTICLES status constraint
-- First drop the old constraint if it exists (name might vary, so we try to generally handle it or ignore if fails, 
-- but in Supabase/Postgres constraints usually have auto-generated names like articles_status_check unless named).
-- We will attempt to drop the constraint by name if we can guess it, otherwise we might need to just add the new one or replace column type.
-- Safest way requires knowing the constraint name. Assuming standard 'articles_status_check'.
do $$
begin
  if exists (select 1 from pg_constraint where conname = 'articles_status_check') then
    alter table articles drop constraint articles_status_check;
  end if;
end $$;

-- Add new constraint
alter table articles add constraint articles_status_check 
  check (status in ('draft', 'pending_review', 'scheduled', 'published', 'shared', 'archived', 'rejected'));

-- 4. Create Junction and Revision tables
create table if not exists article_tags (
  article_id uuid references articles(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (article_id, tag_id)
);

create table if not exists article_revisions (
  id uuid default uuid_generate_v4() primary key,
  article_id uuid references articles(id) on delete cascade,
  content_snapshot jsonb,
  changed_by uuid references profiles(id),
  change_reason text,
  created_at timestamptz default now()
);

-- 5. Enable RLS on new tables (if not already enabled)
alter table tags enable row level security;
alter table media enable row level security;
alter table article_tags enable row level security;
alter table article_revisions enable row level security;

-- 6. Create Policies for new tables (checking existence first or using DO block is complex for policies, 
-- simplest is to drop policy if exists then create, or just try create and ignore error. 
-- For SQL script simplicity, we'll try to create and user can ignore "already exists" errors, or we use a DO block.)

-- Helper block to create policy if not exists
do $$
begin
  -- MEDIA Policies
  if not exists (select from pg_policies where tablename = 'media' and policyname = 'Media is viewable by everyone') then
    create policy "Media is viewable by everyone" on media for select using (true);
  end if;
  
  if not exists (select from pg_policies where tablename = 'media' and policyname = 'Editors can manage media') then
    create policy "Editors can manage media" on media for all using ( exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'editor')) );
  end if;

  -- TAGS Policies
  if not exists (select from pg_policies where tablename = 'tags' and policyname = 'Tags are viewable by everyone') then
    create policy "Tags are viewable by everyone" on tags for select using (true);
  end if;
  
  if not exists (select from pg_policies where tablename = 'tags' and policyname = 'Editors can manage tags') then
    create policy "Editors can manage tags" on tags for all using ( exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'editor')) );
  end if;
  
  -- ARTICLE_REVISIONS Policies
  if not exists (select from pg_policies where tablename = 'article_revisions' and policyname = 'Editors can manage revisions') then
    create policy "Editors can manage revisions" on article_revisions for all using ( exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'editor')) );
  end if;

end $$;

-- 7. Update public read policy for share-only articles
do $$
begin
  if exists (select from pg_policies where tablename = 'articles' and policyname = 'Public articles are viewable by everyone') then
    drop policy "Public articles are viewable by everyone" on articles;
  end if;
  create policy "Public articles are viewable by everyone"
    on articles for select
    using ( status in ('published', 'shared') and published_at <= now() );
end $$;

-- 8. Ensure special issue category exists
insert into categories (name, slug, description)
values ('창간특별호', 'special-edition', '창간특별호 임시 공유 기사 전용')
on conflict (slug) do nothing;

-- 9. Profiles permissions + role backfill for test environment
-- Ensure all signups receive full CMS access during testing.
alter table profiles alter column role set default 'admin';

do $$
begin
  if not exists (select from pg_policies where tablename = 'profiles' and policyname = 'Users can view own profile') then
    create policy "Users can view own profile"
      on profiles for select
      using (id = auth.uid());
  end if;

  if not exists (select from pg_policies where tablename = 'profiles' and policyname = 'Users can update own profile') then
    create policy "Users can update own profile"
      on profiles for update
      using (id = auth.uid());
  end if;
end $$;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    'admin'
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(excluded.full_name, public.profiles.full_name),
      role = 'admin';
  return new;
end;
$$ language plpgsql security definer;

insert into public.profiles (id, email, full_name, role)
select
  au.id,
  au.email,
  coalesce(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name'),
  'admin'
from auth.users au
left join public.profiles p on p.id = au.id
where p.id is null;

update public.profiles
set role = 'admin'
where role is distinct from 'admin';
