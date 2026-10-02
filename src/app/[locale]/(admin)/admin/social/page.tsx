import { requireAdmin } from '@/core/services/authService';
import { getSocialImages } from '@/core/services/socialImageService';
import { getAllBlogPosts } from '@/core/services/blogService';
import { getSettings } from '@/core/services/settingsService';
import { getPublishedProjects } from '@/core/services/portfolioService';
import { defaultOgImage, type SocialPage } from '@/core/utils/socialImages';
import { localizeContent, BLOG_TEXT_FIELDS } from '@/core/utils/localization';
import { getDictionary } from '@/lib/dictionaries';
import type { Locale } from '@/i18n.config';
import { SocialImagesManager } from '@/ui/components/SocialImagesManager';

export default async function SocialImagesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  await requireAdmin();
  const { locale } = await params;
  const [images, posts, settings, projects, dict] = await Promise.all([
    getSocialImages(), getAllBlogPosts(), getSettings(), getPublishedProjects(), getDictionary(locale),
  ]);
  const labels = dict.social_images.pages;
  const sources = [
    { path: '', label: labels.home, image: null },
    { path: '/about', label: labels.about, image: settings.about_image_url || settings.collage_image_2_url },
    { path: '/films', label: labels.films, image: projects.find(project => project.cover_image_url)?.cover_image_url },
    { path: '/blog', label: labels.blog, image: posts.find(post => post.status === 'published' && post.cover_image_url)?.cover_image_url || '/interludes/toast.png' },
    { path: '/contact', label: labels.contact, image: settings.collage_image_2_url || '/interludes/hands.png' },
    ...posts.map(post => ({ path: `/blog/${post.slug}`, label: `${labels.article}: ${localizeContent(post, locale, BLOG_TEXT_FIELDS).title}${post.status === 'draft' ? ` (${dict.social_images.draft})` : ''}`, image: post.cover_image_url })),
  ];
  const pages: SocialPage[] = sources.map(page => ({ path: page.path, label: page.label, defaults: { es: defaultOgImage(page.path, page.image), en: defaultOgImage(page.path, page.image) } }));
  return <SocialImagesManager pages={pages} images={images} dict={dict.social_images} />;
}
