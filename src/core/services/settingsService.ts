import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';
import type { AboutTextSettings } from '@/core/utils/aboutContent';

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
  hero_text_enabled?: boolean;
  hero_overlay_opacity?: number;
  hero_background_type: 'image' | 'video';
  hero_background_url: string | null;
  contact_email: string | null;
  philosophy_phrase_1: string | null;
  philosophy_phrase_2: string | null;
  philosophy_phrase_3: string | null;
  philosophy_enabled: boolean;
  interlude_1_enabled?: boolean;
  interlude_1_quote?: string | null;
  interlude_1_subtitle?: string | null;
  interlude_1_accent?: string | null;
  interlude_1_media_type?: 'image' | 'video';
  interlude_1_media_url?: string | null;
  interlude_2_enabled?: boolean;
  interlude_2_quote?: string | null;
  interlude_2_subtitle?: string | null;
  interlude_2_accent?: string | null;
  interlude_2_media_type?: 'image' | 'video';
  interlude_2_media_url?: string | null;
  collage_image_1_url?: string | null;
  collage_image_2_url?: string | null;
  collage_grayscale_enabled?: boolean;
  collage_title?: string | null;
  collage_text_1?: string | null;
  collage_text_2?: string | null;
  collage_text_3?: string | null;
  collage_text_4?: string | null;
  collage_text_5?: string | null;
  collage_text_6?: string | null;
  collage_signature?: string | null;
  updated_at: string;
  about_media_type?: 'image' | 'video';
  about_image_url?: string | null;
  about_video_url?: string | null;
} & AboutTextSettings;

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
      interlude_1_enabled: true,
      interlude_1_quote: 'Cada historia de amor merece ser contada con la delicadeza de un susurro y la fuerza de lo eterno.',
      interlude_1_subtitle: '— Filosofía Oniria',
      interlude_1_accent: 'eterno',
      interlude_1_media_type: 'image',
      interlude_1_media_url: '/interludes/hands.png',
      interlude_2_enabled: true,
      interlude_2_quote: 'No capturamos momentos. Creamos fragmentos de eternidad que respirarán por siempre.',
      interlude_2_subtitle: '— El Arte de Recordar',
      interlude_2_accent: 'eternidad',
      interlude_2_media_type: 'image',
      interlude_2_media_url: '/interludes/veil.png',
      updated_at: new Date().toISOString()
    };
  }
  
  return {
    ...data,
    interlude_1_enabled: data.interlude_1_enabled ?? true,
    interlude_1_quote: data.interlude_1_quote || 'Cada historia de amor merece ser contada con la delicadeza de un susurro y la fuerza de lo eterno.',
    interlude_1_subtitle: data.interlude_1_subtitle ?? '— Filosofía Oniria',
    interlude_1_accent: data.interlude_1_accent || 'eterno',
    interlude_1_media_type: data.interlude_1_media_type || 'image',
    interlude_1_media_url: data.interlude_1_media_url || '/interludes/hands.png',
    interlude_2_enabled: data.interlude_2_enabled ?? true,
    interlude_2_quote: data.interlude_2_quote || 'No capturamos momentos. Creamos fragmentos de eternidad que respirarán por siempre.',
    interlude_2_subtitle: data.interlude_2_subtitle ?? '— El Arte de Recordar',
    interlude_2_accent: data.interlude_2_accent || 'eternidad',
    interlude_2_media_type: data.interlude_2_media_type || 'image',
    interlude_2_media_url: data.interlude_2_media_url || '/interludes/veil.png',
  } as GlobalSettings;
});
