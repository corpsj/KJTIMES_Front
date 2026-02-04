-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES Table (Extends auth.users, for authors/editors)
create table profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  email text,
  full_name text,
  role text check (role in ('admin', 'editor')) default 'editor',
  created_at timestamptz default now()
);

-- 2. CATEGORIES Table
create table categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz default now()
);

-- 3. TAGS Table
create table tags (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  created_at timestamptz default now()
);

-- 4. MEDIA Table (DAM)
create table media (
  id uuid default uuid_generate_v4() primary key,
  filename text not null,
  url text not null,
  type text not null, -- 'image', 'video', etc.
  alt_text text,
  caption text,
  file_size integer,
  dimensions jsonb, -- {width: 1920, height: 1080}
  uploaded_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- 5. ARTICLES Table (Enhanced)
create table article_revisions (
  id uuid default uuid_generate_v4() primary key,
  article_id uuid, -- Reference added later to avoid circular dependency if needed, or just standard reference
  content_snapshot jsonb,
  changed_by uuid references profiles(id),
  change_reason text,
  created_at timestamptz default now()
);

create table articles (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  sub_title text,
  slug text unique, -- New: SEO friendly URL
  content text, -- Stores HTML content from Tiptap or JSON
  excerpt text, -- New: Short summary for lists/social
  summary text, -- Existing: Keep for backward compatibility or internal use
  thumbnail_url text,
  
  -- SEO Fields
  seo_title text,
  seo_description text,
  keywords text, -- Comma separated keywords
  
  author_id uuid references profiles(id),
  category_id uuid references categories(id),
  
  -- Workflow & Scheduling
  status text check (status in ('draft', 'pending_review', 'scheduled', 'published', 'shared', 'archived', 'rejected')) default 'draft',
  published_at timestamptz, -- New: Scheduled publishing time
  
  views integer default 0,
  is_headline boolean default false,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add foreign key for article_revisions -> articles now that articles exists
alter table article_revisions add constraint fk_article foreign key (article_id) references articles(id) on delete cascade;


-- 6. ARTICLE_TAGS Junction Table
create table article_tags (
  article_id uuid references articles(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (article_id, tag_id)
);


-- RLS Policies (Row Level Security)
alter table profiles enable row level security;
alter table categories enable row level security;
alter table tags enable row level security;
alter table media enable row level security;
alter table articles enable row level security;
alter table article_tags enable row level security;
alter table article_revisions enable row level security;

-- Policies for Articles
-- Everyone can view published articles
create policy "Public articles are viewable by everyone"
  on articles for select
  using ( status in ('published', 'shared') and published_at <= now() );

-- Admins/Editors can do everything
create policy "Editors can manage all articles"
  on articles for all
  using ( exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'editor')) );

-- Categories: Public read, Editor write
create policy "Categories are viewable by everyone"
  on categories for select
  using ( true );

create policy "Editors can insert categories"
  on categories for insert
  with check ( exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'editor')) );

-- Tags: Public read, Editor write
create policy "Tags are viewable by everyone"
  on tags for select
  using ( true );

create policy "Editors can manage tags"
  on tags for all
  using ( exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'editor')) );

-- Media: Public read, Editor write
create policy "Media is viewable by everyone"
  on media for select
  using ( true );

create policy "Editors can manage media"
  on media for all
  using ( exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'editor')) );

-- Article Tags: Public read, Editor write
create policy "Article tags are viewable by everyone"
  on article_tags for select
  using ( true );

create policy "Editors can manage article tags"
  on article_tags for all
  using ( exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'editor')) );

-- Article Revisions: Editor read/write
create policy "Editors can manage revisions"
  on article_revisions for all
  using ( exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'editor')) );


-- Functions to handle new user signup (auto-create profile)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'editor'); -- Defaulting to editor
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Seed Data (Initial Categories)
insert into categories (name, slug) values
('정치', 'politics'),
('경제', 'economy'),
('사회', 'society'),
('생활/문화', 'culture'),
('오피니언', 'opinion'),
('스포츠', 'sports')
on conflict (slug) do nothing;
