-- Run with psql as the database owner. Everything is rolled back.
\set ON_ERROR_STOP on
begin;
select set_config('request.jwt.claim.sub', (select id::text from oniria.user_roles where role::text in ('admin','super_admin') limit 1), true);
set local role authenticated;
do $$
declare review_id uuid; actual smallint;
begin
  insert into oniria.testimonials(name,rating,comment) values ('QA – rolled back',5,'Not a real testimonial; transaction only.') returning id into review_id;
  update oniria.testimonials set rating=4, comment='Edited in transaction' where id=review_id;
  select rating into actual from oniria.testimonials where id=review_id;
  if actual is distinct from 4 then raise exception 'Admin update failed'; end if;
  begin
    update oniria.testimonials set rating=6 where id=review_id;
    raise exception 'Invalid rating accepted';
  exception when check_violation then null; end;
  delete from oniria.testimonials where id=review_id;
  if exists(select 1 from oniria.testimonials where id=review_id) then raise exception 'Admin delete failed'; end if;
end $$;
set local role anon;
select count(*) as public_readable from oniria.testimonials;
do $$ begin
  begin
    insert into oniria.testimonials(name,rating,comment) values ('QA',5,'Must never be saved');
    raise exception 'Anonymous insert accepted';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
select set_config('request.jwt.claim.sub', gen_random_uuid()::text, true);
set local role authenticated;
do $$ begin
  begin
    insert into oniria.testimonials(name,rating,comment) values ('QA',5,'Must never be saved');
    raise exception 'Non-admin insert accepted';
  exception when insufficient_privilege then null; end;
end $$;
rollback;
