import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';

export type GlobalSettings = {
  id: string; // usually '1'
  site_title: string;
  site_description: string | null;
  logo_text: string | null;
  logo_image_url: string | null;
  heading_font: string | null;
  body_font: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_background_type: 'image' | 'video';
  hero_background_url: string | null;
  contact_email: string | null;
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
      heading_font: 'Cabinet Grotesk',
      body_font: 'Inter',
      hero_title: 'CREANDO RECUERDOS ATEMPORALES',
      hero_subtitle: 'Fotografía Editorial de Bodas',
      hero_background_type: 'image',
      hero_background_url: null,
      contact_email: null,
      updated_at: new Date().toISOString()
    };
  }
  
  return data as GlobalSettings;
});

