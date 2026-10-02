import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { Testimonial } from '@/core/utils/testimonials';

export const getTestimonials = cache(async (): Promise<Testimonial[]> => {
  const supabase = await createClient();
  const rows: Testimonial[] = [];
  // Read every page rather than silently truncating at PostgREST's row limit.
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.from('testimonials').select('*')
      .order('created_at', { ascending: false }).order('id').range(offset, offset + 999);
    if (error) throw new Error('No se pudieron cargar los comentarios.');
    rows.push(...data as Testimonial[]);
    if (data.length < 1000) return rows;
  }
});
