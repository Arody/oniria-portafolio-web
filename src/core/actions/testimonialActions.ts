'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/core/services/authService';
import { createClient } from '@/lib/supabase/server';
import { isTestimonialId, validateTestimonial, type Testimonial } from '@/core/utils/testimonials';

async function removeUnusedPhoto(path: string | null) {
  if (!path) return;
  const supabase = await createClient();
  const { count, error } = await supabase.from('testimonials').select('id', { count: 'exact', head: true }).eq('photo_path', path);
  if (!error && count === 0) {
    const { error: removalError } = await supabase.storage.from('oniria').remove([path]);
    if (removalError) console.error('Testimonial photo cleanup failed:', removalError.message);
  }
}

export async function saveTestimonial(input: unknown, id?: string): Promise<{ data?: Testimonial; error?: string }> {
  try { await requireAdmin(); } catch { return { error: 'unauthorized' }; }
  let values;
  try {
    if (id !== undefined && !isTestimonialId(id)) throw new Error('invalid');
    values = validateTestimonial(input);
  } catch { return { error: 'invalid' }; }
  const supabase = await createClient();
  let oldPhoto: string | null = null;
  if (id) {
    const { data, error } = await supabase.from('testimonials').select('photo_path').eq('id', id).single();
    if (error) return { error: 'save_error' };
    oldPhoto = data.photo_path;
  }
  const result = id
    ? await supabase.from('testimonials').update(values).eq('id', id).select().single()
    : await supabase.from('testimonials').insert(values).select().single();
  if (result.error) {
    console.error('Testimonial save failed:', result.error.code);
    return { error: 'save_error' };
  }
  revalidatePath('/', 'layout');
  if (oldPhoto && oldPhoto !== values.photo_path) await removeUnusedPhoto(oldPhoto);
  return { data: result.data as Testimonial };
}

export async function deleteTestimonial(id: string) {
  try { await requireAdmin(); } catch { return { error: 'unauthorized' }; }
  if (!isTestimonialId(id)) return { error: 'invalid' };
  const supabase = await createClient();
  const { data, error } = await supabase.from('testimonials').delete().eq('id', id).select('photo_path').single();
  if (error) return { error: 'delete_error' };
  revalidatePath('/', 'layout');
  await removeUnusedPhoto(data.photo_path);
  return { success: true };
}
