-- Run via psql or MCP execute_sql. All changes are rolled back.
BEGIN;
SELECT set_config('request.jwt.claims', json_build_object('sub', (SELECT id FROM oniria.user_roles WHERE role IN ('super_admin', 'admin') LIMIT 1), 'role', 'authenticated')::text, true);
SET LOCAL ROLE authenticated;
DO $$ DECLARE original_title text; original_subtitle text; BEGIN
  ASSERT oniria.has_role(ARRAY['super_admin', 'admin']), 'An existing admin is required';
  SELECT hero_title, hero_subtitle INTO original_title, original_subtitle FROM oniria.settings;
  UPDATE oniria.settings SET hero_text_enabled = false, hero_overlay_opacity = 0;
  ASSERT (SELECT NOT hero_text_enabled AND hero_overlay_opacity = 0 FROM oniria.settings), 'Video-only settings did not persist';
  UPDATE oniria.settings SET hero_text_enabled = true, hero_overlay_opacity = 100;
  ASSERT (SELECT hero_text_enabled AND hero_overlay_opacity = 100 FROM oniria.settings), 'Text and full overlay settings did not persist';
  ASSERT (SELECT hero_title IS NOT DISTINCT FROM original_title AND hero_subtitle IS NOT DISTINCT FROM original_subtitle FROM oniria.settings), 'Toggling visibility erased saved text';
  BEGIN
    UPDATE oniria.settings SET hero_overlay_opacity = -1;
    RAISE EXCEPTION 'Negative opacity accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN
    UPDATE oniria.settings SET hero_overlay_opacity = 101;
    RAISE EXCEPTION 'Opacity above 100 accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN
    UPDATE oniria.settings SET hero_text_enabled = NULL;
    RAISE EXCEPTION 'Null visibility accepted';
  EXCEPTION WHEN not_null_violation THEN NULL; END;
END $$;
RESET ROLE;
SET LOCAL ROLE anon;
DO $$ BEGIN
  ASSERT (SELECT hero_overlay_opacity = 100 FROM oniria.settings), 'Public hero cannot read display controls';
  BEGIN
    UPDATE oniria.settings SET hero_text_enabled = false;
    RAISE EXCEPTION 'Public visitor changed display controls';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
ROLLBACK;
SELECT 'Hero controls passed: visibility, opacity limits and preserved text; changes rolled back' AS result;
