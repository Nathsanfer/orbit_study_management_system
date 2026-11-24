insert into storage.buckets (id, name, public, file_size_limit)
values ('orbit-topic-assets', 'orbit-topic-assets', false, 52428800)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit;

drop policy if exists "orbit topic assets read" on storage.objects;
create policy "orbit topic assets read"
  on storage.objects for select to authenticated
  using (bucket_id = 'orbit-topic-assets');

drop policy if exists "orbit topic assets upload" on storage.objects;
create policy "orbit topic assets upload"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'orbit-topic-assets');

drop policy if exists "orbit topic assets update" on storage.objects;
create policy "orbit topic assets update"
  on storage.objects for update to authenticated
  using (bucket_id = 'orbit-topic-assets')
  with check (bucket_id = 'orbit-topic-assets');

drop policy if exists "orbit topic assets delete" on storage.objects;
create policy "orbit topic assets delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'orbit-topic-assets');

notify pgrst, 'reload schema';
