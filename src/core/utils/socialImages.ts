import { ogImages } from '../../lib/ogImages.ts';

export const HOME_OG_IMAGE = '/og/oniria-logo-black-v1.jpg';
export const OG_MAX_BYTES = 5 * 1024 * 1024;
export const OG_FILE_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$/;
export const SOCIAL_PAGE_PATHS = ['', '/about', '/films', '/blog', '/contact'];
export type SocialImage = { page_path: string; image_path: string };
export type SocialPage = { path: string; label: string; defaults: { es: string; en: string } };

export function isCustomOgImage(path: string) {
  return path.startsWith('/og/custom/') && OG_FILE_PATTERN.test(path.slice('/og/custom/'.length));
}

export function defaultOgImage(path: string, source?: string | null) {
  return path === '' ? HOME_OG_IMAGE : ogImages[source || ''] || ogImages['/interludes/veil.png'];
}

export function socialPagePaths(path: unknown, language: unknown) {
  if (typeof path !== 'string' || !(SOCIAL_PAGE_PATHS.includes(path) || /^\/blog\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(path))) throw new Error('invalid');
  if (language !== 'es' && language !== 'en' && language !== 'both') throw new Error('invalid');
  return (language === 'both' ? ['es', 'en'] : [language]).map(locale => `/${locale}${path}`);
}
