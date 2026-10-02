import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { pageMetadata } from '@/lib/metadata';
import type { SocialImage } from '@/core/utils/socialImages';

const getSocialImage = cache(async (path: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('social_images').select('image_path').eq('page_path', path).maybeSingle();
  if (error) console.error('Social image read failed:', error.code);
  return data?.image_path as string | undefined;
});

export async function getSocialImages(): Promise<SocialImage[]> {
  const supabase = await createClient();
  const rows: SocialImage[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.from('social_images').select('page_path,image_path').order('page_path').range(offset, offset + 999);
    if (error) throw new Error('Could not load social images');
    rows.push(...data);
    if (data.length < 1000) return rows;
  }
}

export async function getPageMetadata(input: Parameters<typeof pageMetadata>[0]) {
  const socialImage = await getSocialImage(`/${input.locale}${input.path || ''}`);
  return pageMetadata({ ...input, socialImage });
}
