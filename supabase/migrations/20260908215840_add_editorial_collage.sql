-- Nullable values use the localized defaults; empty captions are intentionally hidden.
ALTER TABLE oniria.settings
  ADD COLUMN collage_image_1_url varchar(2048) CHECK (collage_image_1_url ~ '^(https://|/[^/])'),
  ADD COLUMN collage_image_2_url varchar(2048) CHECK (collage_image_2_url ~ '^(https://|/[^/])'),
  ADD COLUMN collage_title varchar(48),
  ADD COLUMN collage_text_1 varchar(80),
  ADD COLUMN collage_text_2 varchar(80),
  ADD COLUMN collage_text_3 varchar(80),
  ADD COLUMN collage_text_4 varchar(80),
  ADD COLUMN collage_text_5 varchar(80),
  ADD COLUMN collage_text_6 varchar(80),
  ADD COLUMN collage_signature varchar(80);

NOTIFY pgrst, 'reload schema';
