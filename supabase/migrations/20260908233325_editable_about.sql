ALTER TABLE oniria.settings
  ADD COLUMN about_label varchar(120),
  ADD COLUMN about_title varchar(200),
  ADD COLUMN about_intro varchar(1000),
  ADD COLUMN about_body varchar(5000),
  ADD COLUMN about_more varchar(80),
  ADD COLUMN about_image_alt varchar(300),
  ADD COLUMN about_approach_title varchar(200),
  ADD COLUMN about_approach_1_title varchar(200),
  ADD COLUMN about_approach_1_text varchar(3000),
  ADD COLUMN about_approach_2_title varchar(200),
  ADD COLUMN about_approach_2_text varchar(3000),
  ADD COLUMN about_approach_3_title varchar(200),
  ADD COLUMN about_approach_3_text varchar(3000),
  ADD COLUMN about_closing_title varchar(200),
  ADD COLUMN about_closing_text varchar(2000),
  ADD COLUMN about_contact varchar(80),
  ADD COLUMN about_films varchar(80),
  ADD COLUMN about_media_type text NOT NULL DEFAULT 'image' CHECK (about_media_type IN ('image', 'video')),
  ADD COLUMN about_image_url varchar(2048) CHECK (about_image_url ~ '^(https://|/[^/])'),
  ADD COLUMN about_video_url varchar(2048) CHECK (about_video_url ~ '^https://(www\.)?(vimeo\.com/[0-9]+(/[a-f0-9]+)?|player\.vimeo\.com/video/[0-9]+)/?([?#][^[:space:]]*)?$'),
  ADD CONSTRAINT about_video_required CHECK (about_media_type <> 'video' OR about_video_url IS NOT NULL);

-- Preserve the current About photo, then keep it independent of the collage.
UPDATE oniria.settings SET about_image_url = collage_image_1_url;

NOTIFY pgrst, 'reload schema';
