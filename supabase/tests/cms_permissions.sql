-- Run through psql or MCP execute_sql. All test writes are rolled back.
BEGIN;
SELECT set_config('oniria_test.admin_id', (SELECT id::text FROM oniria.user_roles WHERE role = 'super_admin' LIMIT 1), true);
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated"}', true);
SET LOCAL ROLE authenticated;
DO $$ DECLARE affected integer; BEGIN
  ASSERT NOT oniria.has_role(ARRAY['super_admin','admin','editor']), 'Unassigned user gained an ONIRIA role';
  ASSERT (SELECT count(*) FROM oniria.messages) = 0, 'Messages leaked';
  ASSERT (SELECT count(*) FROM oniria.user_roles) = 0, 'Roles leaked';
  ASSERT (SELECT count(*) FROM oniria.blog_posts WHERE status = 'draft') = 0, 'Drafts leaked';
  UPDATE oniria.settings SET site_title = site_title;
  GET DIAGNOSTICS affected = ROW_COUNT;
  ASSERT affected = 0, 'Unassigned user changed settings';
  BEGIN
    INSERT INTO storage.objects(bucket_id,name) VALUES ('oniria','settings/permission-test.png');
    RAISE EXCEPTION 'Unassigned user uploaded to ONIRIA';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    INSERT INTO oniria.user_roles(id,role) VALUES (auth.uid(),'super_admin');
    RAISE EXCEPTION 'Unassigned user elevated their own role';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
SELECT set_config('request.jwt.claims', json_build_object('sub',current_setting('oniria_test.admin_id'),'role','authenticated')::text,true);
SET LOCAL ROLE authenticated;
DO $$ DECLARE project_id uuid; post_id uuid; BEGIN
  ASSERT oniria.has_role(ARRAY['super_admin']), 'Existing admin lost access';
  INSERT INTO oniria.portfolio_projects(title,couple_name,status) VALUES ('Permission test','Test','draft') RETURNING id INTO project_id;
  UPDATE oniria.portfolio_projects SET title='Updated test' WHERE id=project_id;
  DELETE FROM oniria.portfolio_projects WHERE id=project_id;
  INSERT INTO oniria.blog_posts(title,slug,status) VALUES ('Permission test',gen_random_uuid()::text,'draft') RETURNING id INTO post_id;
  UPDATE oniria.blog_posts SET title='Updated test' WHERE id=post_id;
  DELETE FROM oniria.blog_posts WHERE id=post_id;
  UPDATE oniria.settings SET site_title=site_title;
  INSERT INTO storage.objects(bucket_id,name) VALUES ('oniria','settings/permission-test.png');
  DELETE FROM storage.objects WHERE bucket_id='oniria' AND name='settings/permission-test.png';
END $$;
RESET ROLE;
UPDATE oniria.user_roles SET role='editor' WHERE id=current_setting('oniria_test.admin_id')::uuid;
SET LOCAL ROLE authenticated;
DO $$ DECLARE affected integer; post_id uuid; BEGIN
  ASSERT oniria.has_role(ARRAY['editor']) AND NOT oniria.has_role(ARRAY['admin','super_admin']), 'Editor elevated privileges';
  ASSERT (SELECT count(*) FROM oniria.messages) = 0, 'Editor can read inquiries';
  UPDATE oniria.settings SET site_title=site_title;
  GET DIAGNOSTICS affected = ROW_COUNT;
  ASSERT affected = 0, 'Editor changed settings';
  INSERT INTO oniria.blog_posts(title,slug,status) VALUES ('Editor test',gen_random_uuid()::text,'draft') RETURNING id INTO post_id;
  DELETE FROM oniria.blog_posts WHERE id=post_id;
  INSERT INTO storage.objects(bucket_id,name) VALUES ('oniria','blog/editor-permission-test.png');
  DELETE FROM storage.objects WHERE bucket_id='oniria' AND name='blog/editor-permission-test.png';
END $$;
RESET ROLE;
SELECT set_config('request.jwt.claims','{"role":"anon"}',true);
SET LOCAL ROLE anon;
DO $$ BEGIN
  ASSERT (SELECT count(*) FROM oniria.settings) = 1, 'Public settings unavailable';
  ASSERT (SELECT count(*) FROM oniria.blog_posts WHERE status='draft') = 0, 'Public drafts leaked';
  INSERT INTO oniria.messages(full_name,email,message) VALUES ('Permission test','test@example.com','A valid test inquiry, rolled back.');
  BEGIN
    INSERT INTO oniria.messages(full_name,email,message,is_read) VALUES ('Permission test','test@example.com','A test inquiry that must be rejected.',true);
    RAISE EXCEPTION 'Public caller forged message status';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
ROLLBACK;
SELECT 'CMS permission checks passed; test data rolled back' AS result;
