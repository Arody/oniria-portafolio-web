import slugify from 'slugify';

// Generar slug único
export async function generateUniqueSlug(supabase: any, title: string, currentId?: string): Promise<string> {
  const baseSlug = slugify(title, { lower: true, strict: true });
  let newSlug = baseSlug;
  let counter = 1;
  let isUnique = false;

  while (!isUnique) {
    const query = supabase.from('blog_posts').select('id').eq('slug', newSlug);
    if (currentId) {
      query.neq('id', currentId);
    }
    const { data } = await query.single();

    if (!data) {
      isUnique = true;
    } else {
      newSlug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  return newSlug;
}
