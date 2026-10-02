begin;
create table oniria.social_images (
  page_path text primary key check (page_path ~ '^/(es|en)(/(about|films|contact|blog)(/[a-z0-9]+(-[a-z0-9]+)*)?)?$'),
  image_path text not null check (image_path ~ '^/og/custom/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$'),
  updated_at timestamptz not null default now()
);
alter table oniria.social_images enable row level security;
revoke all on oniria.social_images from anon, authenticated;
grant select on oniria.social_images to anon;
grant select, insert, update, delete on oniria.social_images to authenticated;
create policy "Public social images" on oniria.social_images for select to anon, authenticated using (true);
create policy "Admins create social images" on oniria.social_images for insert to authenticated
  with check (oniria.has_role(array['super_admin','admin']));
create policy "Admins edit social images" on oniria.social_images for update to authenticated
  using (oniria.has_role(array['super_admin','admin'])) with check (oniria.has_role(array['super_admin','admin']));
create policy "Admins delete social images" on oniria.social_images for delete to authenticated
  using (oniria.has_role(array['super_admin','admin']));
create trigger social_images_updated before update on oniria.social_images
  for each row execute function oniria.update_timestamp();
notify pgrst, 'reload schema';
commit;
