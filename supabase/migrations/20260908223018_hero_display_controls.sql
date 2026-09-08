ALTER TABLE oniria.settings
  ADD COLUMN hero_text_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN hero_overlay_opacity integer NOT NULL DEFAULT 50 CHECK (hero_overlay_opacity BETWEEN 0 AND 100);

NOTIFY pgrst, 'reload schema';
