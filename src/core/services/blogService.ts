import { createClient } from '@/lib/supabase/server';

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  cover_image_url: string | null;
  status: 'draft' | 'published';
  author_id: string | null;
  created_at: string;
  updated_at: string;
};

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching published blog posts:', error);
    return [];
  }
  return data as BlogPost[];
}
