-- Fix: Storage RLS policy for news-images bucket
-- Error: "new row violates row-level security policy" on image upload
--
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- 1. Ensure the bucket exists and is public (for reading uploaded images)
insert into storage.buckets (id, name, public)
values ('news-images', 'news-images', true)
on conflict (id) do update set public = true;

-- 2. Allow authenticated users (admin/editor) to upload files
create policy "Authenticated users can upload images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'news-images');

-- 3. Allow authenticated users to update their uploads
create policy "Authenticated users can update images"
on storage.objects for update
to authenticated
using (bucket_id = 'news-images');

-- 4. Allow authenticated users to delete their uploads
create policy "Authenticated users can delete images"
on storage.objects for delete
to authenticated
using (bucket_id = 'news-images');

-- 5. Allow public read access (for displaying images on the site)
create policy "Public can read news images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'news-images');
