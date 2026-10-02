begin;
alter table oniria.settings
  add column interlude_1_video_urls text[] not null default '{}'
  check (cardinality(interlude_1_video_urls) <= 5 and array_position(interlude_1_video_urls, null) is null);

-- Preserve the configured video as the first option.
update oniria.settings
set interlude_1_video_urls = array[btrim(interlude_1_media_url)]
where interlude_1_media_type = 'video'
  and interlude_1_media_url ~ '^https://(www\.)?(vimeo\.com/[0-9]+|player\.vimeo\.com/video/[0-9]+)';
notify pgrst, 'reload schema';
commit;
