-- Run with psql as database owner; no changes are kept.
\set ON_ERROR_STOP on
begin;
select set_config('request.jwt.claim.sub', (select id::text from oniria.user_roles where role::text in ('admin','super_admin') limit 1), true);
set local role authenticated;
do $$ begin
  insert into oniria.social_images(page_path,image_path) values ('/es/blog/qa-social-image','/og/custom/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.jpg');
  update oniria.social_images set image_path='/og/custom/11111111-2222-3333-4444-555555555555.jpg' where page_path='/es/blog/qa-social-image';
  if not exists(select 1 from oniria.social_images where page_path='/es/blog/qa-social-image' and image_path like '%11111111%') then raise exception 'Admin update failed'; end if;
  begin
    update oniria.social_images set image_path='https://example.com/image.jpg' where page_path='/es/blog/qa-social-image';
    raise exception 'External image URL accepted';
  exception when check_violation then null; end;
end $$;
set local role anon;
do $$ begin
  if not exists(select 1 from oniria.social_images where page_path='/es/blog/qa-social-image') then raise exception 'Public read failed'; end if;
  begin
    insert into oniria.social_images values ('/en/blog/qa-social-image','/og/custom/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.jpg',now());
    raise exception 'Anonymous insert accepted';
  exception when insufficient_privilege then null; end;
  begin
    update oniria.social_images set updated_at=now();
    raise exception 'Anonymous update accepted';
  exception when insufficient_privilege then null; end;
  begin
    delete from oniria.social_images where page_path='/es/blog/qa-social-image';
    raise exception 'Anonymous delete accepted';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
select set_config('request.jwt.claim.sub', gen_random_uuid()::text, true);
set local role authenticated;
do $$ declare changed integer; begin
  begin
    insert into oniria.social_images values ('/en/blog/qa-social-image','/og/custom/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.jpg',now());
    raise exception 'Non-admin insert accepted';
  exception when insufficient_privilege then null; end;
  update oniria.social_images set updated_at=now() where page_path='/es/blog/qa-social-image';
  get diagnostics changed = row_count;
  if changed <> 0 then raise exception 'Non-admin update accepted'; end if;
  delete from oniria.social_images where page_path='/es/blog/qa-social-image';
  get diagnostics changed = row_count;
  if changed <> 0 then raise exception 'Non-admin delete accepted'; end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub', (select id::text from oniria.user_roles where role::text in ('admin','super_admin') limit 1), true);
set local role authenticated;
do $$ begin
  delete from oniria.social_images where page_path='/es/blog/qa-social-image';
  if exists(select 1 from oniria.social_images where page_path='/es/blog/qa-social-image') then raise exception 'Admin delete failed'; end if;
end $$;
rollback;
