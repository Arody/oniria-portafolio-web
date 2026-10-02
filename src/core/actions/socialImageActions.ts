'use server';

import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/core/services/authService';
import { createClient } from '@/lib/supabase/server';
import { socialPagePaths, OG_MAX_BYTES } from '@/core/utils/socialImages';
import { prepareSocialImage, socialImageDirectory } from '@/lib/socialImageFiles';

export async function saveSocialImage(form: FormData) {
  try { await requireAdmin(); } catch { return { error: 'unauthorized' as const }; }
  let paths: string[];
  try { paths = socialPagePaths(form.get('path'), form.get('language')); }
  catch { return { error: 'invalid' as const }; }
  const supabase = await createClient();
  const path = form.get('path') as string;
  if (path.startsWith('/blog/')) {
    const { data, error } = await supabase.from('blog_posts').select('id').eq('slug', path.slice(6)).maybeSingle();
    if (error || !data) return { error: 'invalid' as const };
  }
  if (form.get('reset') === 'true') {
    const { error } = await supabase.from('social_images').delete().in('page_path', paths);
    if (error) return { error: 'save_error' as const };
    revalidatePath('/', 'layout');
    return { success: true };
  }
  const file = form.get('image');
  if (!(file instanceof File) || file.size === 0 || file.size > OG_MAX_BYTES || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return { error: 'invalid_image' as const };
  let image: Buffer;
  try { image = await prepareSocialImage(Buffer.from(await file.arrayBuffer())); }
  catch { return { error: 'invalid_image' as const }; }
  const filename = `${randomUUID()}.jpg`;
  const imagePath = `/og/custom/${filename}`;
  try {
    await mkdir(socialImageDirectory(), { recursive: true });
    await writeFile(join(socialImageDirectory(), filename), image, { flag: 'wx' });
    const { error } = await supabase.from('social_images').upsert(paths.map(page_path => ({ page_path, image_path: imagePath })));
    if (error) throw new Error(error.code);
  } catch (error) {
    // Keep files on uncertain writes and replacements: cached previews may still use their URL.
    console.error('Social image save failed:', error instanceof Error ? error.message : 'unknown');
    return { error: 'save_error' as const };
  }
  revalidatePath('/', 'layout');
  return { success: true };
}
