-- Lycium MediaLab: public video library and game catalog.
-- Run this once in the Supabase SQL Editor for your project.
-- After creating an editor account, run this once per editor (replace the email):
-- update auth.users
-- set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"editor"}'::jsonb
-- where email = 'editor@example.com';
-- The editor must sign in again to receive a token with the new role.

create table if not exists public.media_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  description text not null default '' check (char_length(description) <= 3000),
  source_type text not null check (source_type in ('upload', 'link')),
  rubric_slug text not null default 'les-passages'
    check (rubric_slug in ('les-passages', 'les-legendes', 'la-vie-des-flux', 'formes-et-imaginaires', 'du-savoir-au-faire', 'le-contrechamp', 'laboratoire-ludique')),
  video_url text not null,
  thumbnail_url text,
  credits text not null check (char_length(btrim(credits)) between 1 and 300),
  rights_verified boolean not null default false,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  constraint media_videos_public_rights check (not is_published or rights_verified)
);

create table if not exists public.arcade_games (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  description text not null default '' check (char_length(description) <= 3000),
  game_url text not null,
  rubric_slug text not null default 'laboratoire-ludique'
    check (rubric_slug in ('les-passages', 'les-legendes', 'la-vie-des-flux', 'formes-et-imaginaires', 'du-savoir-au-faire', 'le-contrechamp', 'laboratoire-ludique')),
  cover_url text,
  launch_mode text not null default 'embed' check (launch_mode in ('embed', 'link')),
  rights_verified boolean not null default false,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  constraint arcade_games_public_rights check (not is_published or rights_verified)
);

alter table public.media_videos
  add column if not exists rubric_slug text not null default 'les-passages',
  add column if not exists rights_verified boolean not null default false;
alter table public.arcade_games
  add column if not exists rubric_slug text not null default 'laboratoire-ludique',
  add column if not exists rights_verified boolean not null default false;

-- Existing media must be re-reviewed before it can remain publicly visible.
update public.media_videos set is_published = false where not rights_verified;
update public.arcade_games set is_published = false where not rights_verified;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'media_videos_rubric_slug_check'
      and conrelid = 'public.media_videos'::regclass
  ) then
    alter table public.media_videos
      add constraint media_videos_rubric_slug_check
      check (rubric_slug in ('les-passages', 'les-legendes', 'la-vie-des-flux', 'formes-et-imaginaires', 'du-savoir-au-faire', 'le-contrechamp', 'laboratoire-ludique'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'media_videos_public_rights'
      and conrelid = 'public.media_videos'::regclass
  ) then
    alter table public.media_videos
      add constraint media_videos_public_rights
      check (not is_published or rights_verified);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'arcade_games_rubric_slug_check'
      and conrelid = 'public.arcade_games'::regclass
  ) then
    alter table public.arcade_games
      add constraint arcade_games_rubric_slug_check
      check (rubric_slug in ('les-passages', 'les-legendes', 'la-vie-des-flux', 'formes-et-imaginaires', 'du-savoir-au-faire', 'le-contrechamp', 'laboratoire-ludique'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'arcade_games_public_rights'
      and conrelid = 'public.arcade_games'::regclass
  ) then
    alter table public.arcade_games
      add constraint arcade_games_public_rights
      check (not is_published or rights_verified);
  end if;
end
$$;

alter table public.media_videos enable row level security;
alter table public.arcade_games enable row level security;

grant select on public.media_videos to anon, authenticated;
grant insert, update, delete on public.media_videos to authenticated;
grant select on public.arcade_games to anon, authenticated;
grant insert, update, delete on public.arcade_games to authenticated;

drop policy if exists "Anyone can read published videos" on public.media_videos;
create policy "Anyone can read published videos"
  on public.media_videos for select
  using ((is_published and rights_verified) or (auth.jwt() -> 'app_metadata' ->> 'role') = 'editor');

drop policy if exists "Editors can add videos" on public.media_videos;
create policy "Editors can add videos"
  on public.media_videos for insert to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'editor');

drop policy if exists "Editors can update videos" on public.media_videos;
create policy "Editors can update videos"
  on public.media_videos for update to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'editor')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'editor');

drop policy if exists "Editors can delete videos" on public.media_videos;
create policy "Editors can delete videos"
  on public.media_videos for delete to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'editor');

drop policy if exists "Anyone can read published games" on public.arcade_games;
create policy "Anyone can read published games"
  on public.arcade_games for select
  using ((is_published and rights_verified) or (auth.jwt() -> 'app_metadata' ->> 'role') = 'editor');

drop policy if exists "Editors can add games" on public.arcade_games;
create policy "Editors can add games"
  on public.arcade_games for insert to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'editor');

drop policy if exists "Editors can update games" on public.arcade_games;
create policy "Editors can update games"
  on public.arcade_games for update to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'editor')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'editor');

drop policy if exists "Editors can delete games" on public.arcade_games;
create policy "Editors can delete games"
  on public.arcade_games for delete to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'editor');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'lycium-videos',
  'lycium-videos',
  true,
  104857600,
  array['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can read public Lycium videos" on storage.objects;
create policy "Anyone can read public Lycium videos"
  on storage.objects for select
  using (bucket_id = 'lycium-videos');

drop policy if exists "Editors can upload Lycium videos" on storage.objects;
create policy "Editors can upload Lycium videos"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'lycium-videos'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'editor'
  );

drop policy if exists "Editors can update Lycium videos" on storage.objects;
create policy "Editors can update Lycium videos"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'lycium-videos'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'editor'
  )
  with check (
    bucket_id = 'lycium-videos'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'editor'
  );

drop policy if exists "Editors can delete Lycium videos" on storage.objects;
create policy "Editors can delete Lycium videos"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'lycium-videos'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'editor'
  );
