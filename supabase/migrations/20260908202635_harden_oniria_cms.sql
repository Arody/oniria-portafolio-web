BEGIN;
-- Keep the privileged role lookup outside PostgREST's exposed schemas.
CREATE SCHEMA IF NOT EXISTS oniria_private;
REVOKE ALL ON SCHEMA oniria_private FROM PUBLIC;
GRANT USAGE ON SCHEMA oniria_private TO authenticated;
CREATE OR REPLACE FUNCTION oniria_private.has_role(required_roles text[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM oniria.user_roles
    WHERE id = auth.uid() AND role::text = ANY(required_roles)
  );
$$;
REVOKE ALL ON FUNCTION oniria_private.has_role(text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION oniria_private.has_role(text[]) TO authenticated;
CREATE OR REPLACE FUNCTION oniria.has_role(required_roles text[])
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' AS $$
  SELECT oniria_private.has_role(required_roles);
$$;
REVOKE ALL ON FUNCTION oniria.has_role(text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION oniria.has_role(text[]) TO authenticated;

-- A role can only be granted explicitly by an existing super administrator.
DROP POLICY IF EXISTS "Admin can view roles and manage editors" ON oniria.user_roles;
ALTER POLICY "Super admin can do all on user_roles" ON oniria.user_roles
  USING (oniria.has_role(ARRAY['super_admin']))
  WITH CHECK (oniria.has_role(ARRAY['super_admin']));
DROP POLICY IF EXISTS "Allow authenticated to update settings" ON oniria.settings;
DROP POLICY IF EXISTS "Super and Admin can update settings" ON oniria.settings;
CREATE POLICY "Super and Admin can update settings" ON oniria.settings
  FOR UPDATE TO authenticated
  USING (oniria.has_role(ARRAY['super_admin','admin']))
  WITH CHECK (oniria.has_role(ARRAY['super_admin','admin']));

-- Only ONIRIA staff may write its storage bucket. Other buckets are untouched.
ALTER POLICY "Authenticated users can upload to oniria bucket" ON storage.objects
  WITH CHECK (bucket_id = 'oniria' AND oniria.has_role(ARRAY['super_admin','admin','editor'])
    AND (oniria.has_role(ARRAY['super_admin','admin']) OR (storage.foldername(name))[1] = 'blog'));
ALTER POLICY "Authenticated users can update oniria bucket" ON storage.objects
  USING (bucket_id = 'oniria' AND oniria.has_role(ARRAY['super_admin','admin','editor'])
    AND (oniria.has_role(ARRAY['super_admin','admin']) OR (storage.foldername(name))[1] = 'blog'))
  WITH CHECK (bucket_id = 'oniria' AND oniria.has_role(ARRAY['super_admin','admin','editor'])
    AND (oniria.has_role(ARRAY['super_admin','admin']) OR (storage.foldername(name))[1] = 'blog'));
ALTER POLICY "Authenticated users can delete from oniria bucket" ON storage.objects
  USING (bucket_id = 'oniria' AND oniria.has_role(ARRAY['super_admin','admin','editor'])
    AND (oniria.has_role(ARRAY['super_admin','admin']) OR (storage.foldername(name))[1] = 'blog'));
UPDATE storage.buckets SET file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/gif','image/avif']
WHERE id = 'oniria';

-- Public submissions cannot mark themselves as already read or supply empty/huge fields.
ALTER POLICY "Public can insert messages" ON oniria.messages
  WITH CHECK (is_read = false AND char_length(btrim(full_name)) BETWEEN 2 AND 120
    AND char_length(email) BETWEEN 3 AND 254
    AND email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    AND char_length(btrim(message)) BETWEEN 10 AND 5000
    AND (phone IS NULL OR char_length(phone) <= 40));
REVOKE ALL ON ALL TABLES IN SCHEMA oniria FROM anon;
GRANT USAGE ON SCHEMA oniria TO anon, authenticated;
GRANT SELECT ON oniria.settings, oniria.blog_posts, oniria.portfolio_projects TO anon;
GRANT INSERT ON oniria.messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA oniria TO authenticated;
REVOKE TRUNCATE, REFERENCES, TRIGGER ON ALL TABLES IN SCHEMA oniria FROM authenticated;
ALTER TABLE oniria.settings ALTER COLUMN is_singleton SET NOT NULL;
UPDATE oniria.settings SET contact_email = 'hello@oniriaweddings.com' WHERE contact_email IS NULL OR contact_email = '';
ALTER FUNCTION oniria.update_timestamp() SET search_path = '';
COMMIT;
