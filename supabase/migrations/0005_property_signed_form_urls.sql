-- Allow more than one scanned/signed agreement form per property.
-- Adds an array column and backfills it from the existing single-value column.

alter table public.properties
  add column if not exists signed_form_urls text[] not null default '{}';

update public.properties
  set signed_form_urls = array[signed_form_url]
  where signed_form_url is not null
    and (signed_form_urls is null or signed_form_urls = '{}');
