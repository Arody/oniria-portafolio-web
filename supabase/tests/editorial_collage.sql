-- Run via psql or MCP execute_sql. No test data is published.
BEGIN;
SELECT set_config('request.jwt.claims', json_build_object('sub', (SELECT id FROM oniria.user_roles WHERE role IN ('super_admin', 'admin') LIMIT 1), 'role', 'authenticated')::text, true);
SET LOCAL ROLE authenticated;
DO $$ BEGIN
  ASSERT oniria.has_role(ARRAY['super_admin', 'admin']), 'An existing admin is required';
  UPDATE oniria.settings SET collage_grayscale_enabled = false;
  ASSERT (SELECT collage_grayscale_enabled = false FROM oniria.settings), 'Color mode did not persist';
  UPDATE oniria.settings SET collage_grayscale_enabled = true;
  ASSERT (SELECT collage_grayscale_enabled = true FROM oniria.settings), 'Black and white mode did not persist';
  UPDATE oniria.settings SET
    collage_image_1_url = '/interludes/hands.png',
    collage_image_2_url = '/interludes/veil.png',
    collage_title = 'Editorial test',
    collage_text_1 = 'One', collage_text_2 = 'Two', collage_text_3 = 'Three',
    collage_text_4 = 'Four', collage_text_5 = 'Five', collage_text_6 = 'Six',
    collage_signature = 'Signature';
  ASSERT (SELECT collage_image_1_url = '/interludes/hands.png' AND collage_image_2_url = '/interludes/veil.png'
    AND collage_title = 'Editorial test' AND collage_text_1 = 'One' AND collage_text_2 = 'Two'
    AND collage_text_3 = 'Three' AND collage_text_4 = 'Four' AND collage_text_5 = 'Five'
    AND collage_text_6 = 'Six' AND collage_signature = 'Signature' FROM oniria.settings), 'Collage settings did not persist';
  UPDATE oniria.settings SET collage_text_1 = '', collage_image_1_url = NULL;
  ASSERT (SELECT collage_text_1 = '' AND collage_image_1_url IS NULL FROM oniria.settings), 'Hidden captions and default images must remain distinct';
  BEGIN
    UPDATE oniria.settings SET collage_image_1_url = 'javascript:alert(1)';
    RAISE EXCEPTION 'Unsafe image URL accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN
    UPDATE oniria.settings SET collage_text_1 = repeat('x', 81);
    RAISE EXCEPTION 'Oversized caption accepted';
  EXCEPTION WHEN string_data_right_truncation THEN NULL; END;
END $$;
RESET ROLE;
SET LOCAL ROLE anon;
DO $$ BEGIN
  ASSERT (SELECT collage_text_6 = 'Six' FROM oniria.settings), 'Public homepage cannot read collage';
  BEGIN
    UPDATE oniria.settings SET collage_text_6 = 'Unauthorized';
    RAISE EXCEPTION 'Public visitor changed collage';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
ROLLBACK;
SELECT 'Editorial collage persistence and validation passed; test changes rolled back' AS result;
