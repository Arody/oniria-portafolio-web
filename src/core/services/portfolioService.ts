import { localizeContent, PROJECT_TEXT_FIELDS, type Translations } from '@/core/utils/localization';
import { createClient } from '@/lib/supabase/server';

export type PortfolioProject = {
  translations?: Translations;
  id: string;
  title: string;
  couple_name: string;
  location: string | null;
  event_date: string | null;
  description: string | null;
  category: 'Bodas' | 'Pre-boda' | 'Detalles' | 'Recepción' | null;
  status: 'draft' | 'published';
  video_url: string | null;
  cover_image_url: string | null;
  images: string[];
  display_order: number;
  created_at: string;
  updated_at: string;
};

// Fetch published projects for public landing page
export async function getPublishedProjects(locale?: string): Promise<PortfolioProject[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('portfolio_projects')
    .select('*')
    .eq('status', 'published')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching published projects:', error);
    return [];
  }
  return (data as PortfolioProject[]).map(record => localizeContent(record, locale, PROJECT_TEXT_FIELDS));
}

// Fetch all projects for admin dashboard
export async function getAllProjects(): Promise<PortfolioProject[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('portfolio_projects')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching all projects:', error);
    return [];
  }
  return data as PortfolioProject[];
}

// Fetch single project by ID
export async function getProjectById(id: string): Promise<PortfolioProject | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('portfolio_projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching project with id ${id}:`, error);
    return null;
  }
  return data as PortfolioProject;
}
