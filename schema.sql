-- Run this entire file in Supabase > SQL Editor > New query.
create table if not exists public.posts (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 title text not null, category text not null default 'General Studies',
 excerpt text default '', body text not null,
 is_public boolean not null default false,
 created_at timestamptz not null default now()
);
create table if not exists public.documents (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 title text not null, category text not null default 'Other',
 storage_path text not null,
 is_public boolean not null default false,
 created_at timestamptz not null default now()
);
create table if not exists public.followers (
 id uuid primary key default gen_random_uuid(),
 email text not null unique,
 created_at timestamptz not null default now()
);
alter table public.posts enable row level security;
alter table public.documents enable row level security;
alter table public.followers enable row level security;
create policy "Public can read published posts" on public.posts for select using (is_public=true);
create policy "Owner manages own posts" on public.posts for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "Public can read published document metadata" on public.documents for select using (is_public=true);
create policy "Owner manages own documents" on public.documents for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "Anyone can follow" on public.followers for insert to anon, authenticated with check (true);
create policy "Owner can read followers" on public.followers for select to authenticated using (exists(select 1 from public.posts p where p.user_id=auth.uid()));
-- Create a PRIVATE storage bucket named archive-documents in Storage.
-- Storage object policies: authenticated users can upload/read/delete only inside their own user-id folder.
create policy "Owner uploads own files" on storage.objects for insert to authenticated
 with check (bucket_id='archive-documents' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "Owner reads own files" on storage.objects for select to authenticated
 using (bucket_id='archive-documents' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "Owner deletes own files" on storage.objects for delete to authenticated
 using (bucket_id='archive-documents' and (storage.foldername(name))[1]=auth.uid()::text);

-- Allow visitors to request short-lived signed links only for published documents.
create policy "Visitors can read published document objects" on storage.objects for select to anon, authenticated
 using (bucket_id='archive-documents' and exists (
   select 1 from public.documents d where d.storage_path=name and d.is_public=true
 ));
