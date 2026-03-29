-- Add philosophy phrases columns to the settings table
-- These power the scroll-pinned hero philosophy section

ALTER TABLE oniria.settings
  ADD COLUMN IF NOT EXISTS philosophy_phrase_1 TEXT DEFAULT 'No fotografiamos bodas. Inmortalizamos la forma en que se miran cuando creen que nadie los ve.',
  ADD COLUMN IF NOT EXISTS philosophy_phrase_2 TEXT DEFAULT 'Cada encuadre es una decisión emocional. Buscamos la verdad en lo efímero, la belleza en lo invisible.',
  ADD COLUMN IF NOT EXISTS philosophy_phrase_3 TEXT DEFAULT 'Creamos relatos visuales que se sienten como recuerdos propios — íntimos, eternos, irrepetibles.',
  ADD COLUMN IF NOT EXISTS philosophy_enabled BOOLEAN DEFAULT true;
