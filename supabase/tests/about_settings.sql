BEGIN;
SELECT set_config('request.jwt.claims', json_build_object('sub', (SELECT id FROM oniria.user_roles WHERE role IN ('super_admin', 'admin') LIMIT 1), 'role', 'authenticated')::text, true);
SET LOCAL ROLE authenticated;
DO $$ DECLARE original_collage text; BEGIN
  SELECT collage_image_1_url INTO original_collage FROM oniria.settings;
  UPDATE oniria.settings SET about_title = 'Edited About', about_body = '', about_approach_3_text = 'Third approach',
    about_more = 'Meet Oniria', about_contact = 'Get in touch', about_image_url = '/interludes/hands.png',
    about_video_url = 'https://vimeo.com/123456/abcdef', about_media_type = 'video';
  ASSERT (SELECT about_title = 'Edited About' AND about_body = '' AND about_approach_3_text = 'Third approach'
    AND about_more = 'Meet Oniria' AND about_contact = 'Get in touch' AND about_media_type = 'video'
    AND about_video_url = 'https://vimeo.com/123456/abcdef' FROM oniria.settings), 'About edits did not persist';
  UPDATE oniria.settings SET about_media_type = 'image';
  ASSERT (SELECT about_image_url = '/interludes/hands.png' AND about_video_url = 'https://vimeo.com/123456/abcdef'
    AND collage_image_1_url IS NOT DISTINCT FROM original_collage FROM oniria.settings), 'Switching media lost a URL or changed collage';
  BEGIN
    UPDATE oniria.settings SET about_video_url = 'https://vimeo.com.evil.test/123';
    RAISE EXCEPTION 'Non-Vimeo URL accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN
    UPDATE oniria.settings SET about_image_url = 'javascript:alert(1)';
    RAISE EXCEPTION 'Unsafe image URL accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN
    UPDATE oniria.settings SET about_video_url = NULL, about_media_type = 'video';
    RAISE EXCEPTION 'Video without URL accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN
    UPDATE oniria.settings SET about_title = repeat('x', 201);
    RAISE EXCEPTION 'Oversized title accepted';
  EXCEPTION WHEN string_data_right_truncation THEN NULL; END;
END $$;
RESET ROLE;
SET LOCAL ROLE anon;
DO $$ BEGIN
  ASSERT (SELECT about_title = 'Edited About' FROM oniria.settings), 'Public About cannot read edits';
  BEGIN
    UPDATE oniria.settings SET about_title = 'Unauthorized';
    RAISE EXCEPTION 'Public visitor edited About';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
ROLLBACK;
SELECT 'About persistence, media validation and permissions passed; test changes rolled back' AS result;
