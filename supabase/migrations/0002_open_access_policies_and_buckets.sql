-- 0002_open_access_policies_and_buckets.sql
-- Open-access RLS for the no-login phase, plus storage buckets.
--
-- SECURITY NOTE: these policies allow anyone with the publishable key to read
-- and write all rows. That is intentional for the current "no login yet" phase.
-- When you add authentication, replace the "open access" policies with ones
-- scoped to auth.uid() (e.g. add an owner_id column and check it).

alter table public.properties enable row level security;
alter table public.property_owners enable row level security;
alter table public.property_media enable row level security;
alter table public.app_settings enable row level security;

create policy "open access" on public.properties      for all to anon, authenticated using (true) with check (true);
create policy "open access" on public.property_owners for all to anon, authenticated using (true) with check (true);
create policy "open access" on public.property_media  for all to anon, authenticated using (true) with check (true);
create policy "open access" on public.app_settings    for all to anon, authenticated using (true) with check (true);

-- Storage buckets for media and scanned forms
insert into storage.buckets (id, name, public)
values ('property-media','property-media', true),
       ('signed-forms','signed-forms', true)
on conflict (id) do nothing;

create policy "media public read"   on storage.objects for select to anon, authenticated using (bucket_id in ('property-media','signed-forms'));
create policy "media public write"  on storage.objects for insert to anon, authenticated with check (bucket_id in ('property-media','signed-forms'));
create policy "media public update" on storage.objects for update to anon, authenticated using (bucket_id in ('property-media','signed-forms')) with check (bucket_id in ('property-media','signed-forms'));
create policy "media public delete" on storage.objects for delete to anon, authenticated using (bucket_id in ('property-media','signed-forms'));
