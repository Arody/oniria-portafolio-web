import slugify from 'slugify';
import type { createClient } from '@/lib/supabase/client';

// Generar slug único
export async function generateUniqueSlug(supabase: ReturnType<typeof createClient>, title: string, currentId?: string): Promise<string> {
  const baseSlug = slugify(title, { lower: true, strict: true }) || crypto.randomUUID();
  let newSlug = baseSlug;
  let counter = 1;
  let isUnique = false;

  while (!isUnique) {
    const query = supabase.from('blog_posts').select('id').eq('slug', newSlug);
    if (currentId) {
      query.neq('id', currentId);
    }
    const { data, error } = await query.maybeSingle();
    if (error) throw error;

    if (!data) {
      isUnique = true;
    } else {
      newSlug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  return newSlug;
}
