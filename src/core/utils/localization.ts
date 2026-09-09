import { ABOUT_TEXT_LIMITS } from './aboutContent.ts';

export type Translations = Partial<Record<'es' | 'en', Record<string, string>>>;
export const SETTINGS_TEXT_FIELDS = ['site_title', 'site_description', 'hero_title', 'hero_subtitle', 'philosophy_phrase_1', 'philosophy_phrase_2', 'philosophy_phrase_3', 'interlude_1_quote', 'interlude_1_subtitle', 'interlude_1_accent', 'interlude_2_quote', 'interlude_2_subtitle', 'interlude_2_accent', 'collage_title', 'collage_text_1', 'collage_text_2', 'collage_text_3', 'collage_text_4', 'collage_text_5', 'collage_text_6', 'collage_signature', ...Object.keys(ABOUT_TEXT_LIMITS).map(key => `about_${key}`)];
export const PROJECT_TEXT_FIELDS = ['title', 'description'];
export const BLOG_TEXT_FIELDS = ['title', 'excerpt', 'content', 'category'];

export function localizeContent<T extends { translations?: Translations }>(record: T, locale: string | undefined, fields: readonly string[]): T {
  const translated = record.translations?.[locale as 'es' | 'en'];
  if (!translated) return record;
  return { ...record, ...Object.fromEntries(fields.filter(key => typeof translated[key] === 'string').map(key => [key, translated[key]])) };
}

export function localizedHref(href: string, locale: 'es' | 'en') {
  return href.replace(/^\/(?:es|en)(?=\/|[?#]|$)/, `/${locale}`);
}
