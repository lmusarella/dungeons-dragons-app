-- Tabella per archivio file sessioni legati al diario
-- Compatibile con upload su bucket Storage dedicato: journal-session-files

create extension if not exists "pgcrypto";

create table if not exists public.journal_session_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  character_id uuid not null references public.characters(id) on delete cascade,
  journal_entry_id uuid references public.journal_entries(id) on delete set null,
  session_no integer,
  file_name text not null,
  file_path text not null unique,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint journal_session_files_session_no_ck check (session_no is null or session_no >= 0)
);

create index if not exists journal_session_files_user_idx
  on public.journal_session_files (user_id);

create index if not exists journal_session_files_character_idx
  on public.journal_session_files (character_id);

create index if not exists journal_session_files_journal_entry_idx
  on public.journal_session_files (journal_entry_id);

create index if not exists journal_session_files_created_at_idx
  on public.journal_session_files (created_at desc);

create or replace function public.set_journal_session_files_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_journal_session_files_updated_at on public.journal_session_files;
create trigger trg_journal_session_files_updated_at
before update on public.journal_session_files
for each row
execute function public.set_journal_session_files_updated_at();

alter table public.journal_session_files enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'journal_session_files'
      and policyname = 'journal_session_files_select_own'
  ) then
    create policy journal_session_files_select_own
      on public.journal_session_files
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'journal_session_files'
      and policyname = 'journal_session_files_insert_own'
  ) then
    create policy journal_session_files_insert_own
      on public.journal_session_files
      for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'journal_session_files'
      and policyname = 'journal_session_files_update_own'
  ) then
    create policy journal_session_files_update_own
      on public.journal_session_files
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'journal_session_files'
      and policyname = 'journal_session_files_delete_own'
  ) then
    create policy journal_session_files_delete_own
      on public.journal_session_files
      for delete
      using (auth.uid() = user_id);
  end if;
end $$;

-- Bucket Storage (opzionale ma consigliato): journal-session-files
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'journal-session-files',
  'journal-session-files',
  false,
  10485760,
  array['application/pdf']
)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'journal_session_files_storage_select_own'
  ) then
    create policy journal_session_files_storage_select_own
      on storage.objects
      for select
      using (
        bucket_id = 'journal-session-files'
        and auth.uid()::text = split_part(name, '/', 1)
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'journal_session_files_storage_insert_own'
  ) then
    create policy journal_session_files_storage_insert_own
      on storage.objects
      for insert
      with check (
        bucket_id = 'journal-session-files'
        and auth.uid()::text = split_part(name, '/', 1)
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'journal_session_files_storage_update_own'
  ) then
    create policy journal_session_files_storage_update_own
      on storage.objects
      for update
      using (
        bucket_id = 'journal-session-files'
        and auth.uid()::text = split_part(name, '/', 1)
      )
      with check (
        bucket_id = 'journal-session-files'
        and auth.uid()::text = split_part(name, '/', 1)
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'journal_session_files_storage_delete_own'
  ) then
    create policy journal_session_files_storage_delete_own
      on storage.objects
      for delete
      using (
        bucket_id = 'journal-session-files'
        and auth.uid()::text = split_part(name, '/', 1)
      );
  end if;
end $$;
