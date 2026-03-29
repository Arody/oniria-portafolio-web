import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';

export type GlobalSettings = {
  id: string; // usually '1'
  site_title: string;
  site_description: string | null;
  logo_text: string | null;
  logo_image_url: string | null;
  logo_size: number;
  heading_font: string | null;
  body_font: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_background_type: 'image' | 'video';
  hero_background_url: string | null;
  contact_email: string | null;
  philosophy_phrase_1: string | null;
  philosophy_phrase_2: string | null;
  philosophy_phrase_3: string | null;
  philosophy_enabled: boolean;
  updated_at: string;
};

// Fetch current settings
// We use .limit(1).single() because it's a singleton table
// We also wrap it in React's cache so calling it multiple times in one render pass only hits the DB once
export const getSettings = cache(async (): Promise<GlobalSettings> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .schema('oniria')
    .from('settings')
    .select('*')
    .limit(1)
    .single();

  if (error || !data) {
    console.error('Error fetching settings, returning defaults:', error);
    // Return sensible defaults if nothing is in DB yet to prevent crashes
    return {
      id: 'default',
      site_title: 'Oniria Weddings',
      site_description: 'Fotografía Editorial de Bodas',
      logo_text: 'ONIRIA.',
      logo_image_url: null,
      logo_size: 40,
      heading_font: 'Cabinet Grotesk',
      body_font: 'Inter',
      hero_title: 'CREANDO RECUERDOS ATEMPORALES',
      hero_subtitle: 'Fotografía Editorial de Bodas',
      hero_background_type: 'image',
      hero_background_url: null,
      contact_email: null,
      philosophy_phrase_1: 'No fotografiamos bodas. Inmortalizamos la forma en que se miran cuando creen que nadie los ve.',
      philosophy_phrase_2: 'Cada encuadre es una decisión emocional. Buscamos la verdad en lo efímero, la belleza en lo invisible.',
      philosophy_phrase_3: 'Creamos relatos visuales que se sienten como recuerdos propios — íntimos, eternos, irrepetibles.',
      philosophy_enabled: true,
      updated_at: new Date().toISOString()
    };
  }
  
  return data as GlobalSettings;
});

