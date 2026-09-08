-- Add editorial interludes configuration columns to the settings table
-- These power the customizable interlude sections on the home page

ALTER TABLE oniria.settings
  ADD COLUMN IF NOT EXISTS interlude_1_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS interlude_1_quote TEXT DEFAULT 'Cada historia de amor merece ser contada con la delicadeza de un susurro y la fuerza de lo eterno.',
  ADD COLUMN IF NOT EXISTS interlude_1_subtitle TEXT DEFAULT '— Filosofía Oniria',
  ADD COLUMN IF NOT EXISTS interlude_1_accent TEXT DEFAULT 'eterno',
  ADD COLUMN IF NOT EXISTS interlude_1_media_type TEXT DEFAULT 'image' CHECK (interlude_1_media_type IN ('image', 'video')),
  ADD COLUMN IF NOT EXISTS interlude_1_media_url TEXT DEFAULT '/interludes/hands.png',

  ADD COLUMN IF NOT EXISTS interlude_2_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS interlude_2_quote TEXT DEFAULT 'No capturamos momentos. Creamos fragmentos de eternidad que respirarán por siempre.',
  ADD COLUMN IF NOT EXISTS interlude_2_subtitle TEXT DEFAULT '— El Arte de Recordar',
  ADD COLUMN IF NOT EXISTS interlude_2_accent TEXT DEFAULT 'eternidad',
  ADD COLUMN IF NOT EXISTS interlude_2_media_type TEXT DEFAULT 'image' CHECK (interlude_2_media_type IN ('image', 'video')),
  ADD COLUMN IF NOT EXISTS interlude_2_media_url TEXT DEFAULT '/interludes/veil.png';
