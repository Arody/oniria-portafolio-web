ALTER TABLE oniria.settings ADD COLUMN IF NOT EXISTS collage_grayscale_enabled boolean NOT NULL DEFAULT true;
NOTIFY pgrst, 'reload schema';
