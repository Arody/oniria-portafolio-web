-- 1. Enable full replica identity so Realtime broadcasts all row data on UPDATE
ALTER TABLE oniria.settings REPLICA IDENTITY FULL;

-- 2. Add oniria.settings to the Supabase Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE oniria.settings;

-- 3. Ensure any authenticated user who accesses the admin panel can update settings without silent RLS blocks
DROP POLICY IF EXISTS "Super and Admin can update settings" ON oniria.settings;
DROP POLICY IF EXISTS "Allow authenticated to update settings" ON oniria.settings;

CREATE POLICY "Allow authenticated to update settings"
ON oniria.settings FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);
