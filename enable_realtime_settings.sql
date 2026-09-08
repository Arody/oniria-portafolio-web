-- Realtime only. Permissions are maintained in supabase/migrations.
-- Never assign ONIRIA roles to all users of this shared Supabase instance.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'oniria' AND tablename = 'settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE oniria.settings;
  END IF;
END $$;
ALTER TABLE oniria.settings REPLICA IDENTITY FULL;
