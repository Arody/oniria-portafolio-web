begin;
create table oniria.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  rating smallint not null check (rating between 1 and 5),
  comment text not null check (char_length(btrim(comment)) between 1 and 3000),
  comment_en text check (char_length(comment_en) <= 3000),
  photo_path text check (photo_path ~ '^testimonials/[0-9a-f-]+\.(jpg|png|webp|gif|avif)$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table oniria.testimonials enable row level security;
revoke all on oniria.testimonials from anon, authenticated;
grant select on oniria.testimonials to anon;
grant select, insert, update, delete on oniria.testimonials to authenticated;
create policy "Public testimonials" on oniria.testimonials for select to anon, authenticated using (true);
create policy "Admins create testimonials" on oniria.testimonials for insert to authenticated
  with check (oniria.has_role(array['super_admin','admin']));
create policy "Admins edit testimonials" on oniria.testimonials for update to authenticated
  using (oniria.has_role(array['super_admin','admin'])) with check (oniria.has_role(array['super_admin','admin']));
create policy "Admins delete testimonials" on oniria.testimonials for delete to authenticated
  using (oniria.has_role(array['super_admin','admin']));
create index testimonials_created_idx on oniria.testimonials (created_at desc, id);
create trigger testimonials_updated before update on oniria.testimonials
  for each row execute function oniria.update_timestamp();
notify pgrst, 'reload schema';
commit;
