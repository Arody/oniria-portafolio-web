export type TestimonialInput = {
  name: string;
  rating: number;
  comment: string;
  comment_en: string | null;
  photo_path: string | null;
};
export type Testimonial = TestimonialInput & { id: string; created_at: string; updated_at: string };
export const isTestimonialId = (id: unknown): id is string => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export function validateTestimonial(input: unknown): TestimonialInput {
  if (!input || typeof input !== 'object') throw new Error('invalid');
  const value = input as Record<string, unknown>;
  const name = typeof value.name === 'string' ? value.name.trim() : '';
  const comment = typeof value.comment === 'string' ? value.comment.trim() : '';
  const comment_en = typeof value.comment_en === 'string' ? value.comment_en.trim() || null : null;
  const photo_path = value.photo_path === null || value.photo_path === undefined ? null : value.photo_path;
  if (!name || name.length > 120 || !comment || comment.length > 3000 || (comment_en && comment_en.length > 3000)) throw new Error('invalid');
  if (typeof value.rating !== 'number' || !Number.isInteger(value.rating) || value.rating < 1 || value.rating > 5) throw new Error('invalid');
  if (photo_path !== null && (typeof photo_path !== 'string' || !/^testimonials\/[0-9a-f-]+\.(jpg|png|webp|gif|avif)$/.test(photo_path))) throw new Error('invalid');
  return { name, rating: value.rating, comment, comment_en, photo_path };
}

export function testimonialPhoto(path: string | null) {
  return path ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/oniria/${path}` : null;
}
