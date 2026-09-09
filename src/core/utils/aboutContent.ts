import type { Dictionary } from '@/lib/dictionaries';

export const ABOUT_TEXT_LIMITS = {
  label: 120, title: 200, intro: 1000, body: 5000, more: 80, image_alt: 300,
  approach_title: 200,
  approach_1_title: 200, approach_1_text: 3000,
  approach_2_title: 200, approach_2_text: 3000,
  approach_3_title: 200, approach_3_text: 3000,
  closing_title: 200, closing_text: 2000, contact: 80, films: 80,
} as const;
export type AboutTextKey = keyof typeof ABOUT_TEXT_LIMITS;
export type AboutTextSettings = Partial<Record<`about_${AboutTextKey}`, string | null>>;

export function getAboutContent(settings: AboutTextSettings, dict: Dictionary['about']) {
  const { approach, ...text } = dict;
  const defaults = {
    ...text,
    approach_1_title: approach[0].title, approach_1_text: approach[0].text,
    approach_2_title: approach[1].title, approach_2_text: approach[1].text,
    approach_3_title: approach[2].title, approach_3_text: approach[2].text,
  };
  return Object.fromEntries((Object.keys(ABOUT_TEXT_LIMITS) as AboutTextKey[])
    .map(key => [key, settings[`about_${key}`] ?? defaults[key]])) as Record<AboutTextKey, string>;
}

export function isAboutVimeoUrl(value: string) {
  return /^https:\/\/(?:www\.)?(?:vimeo\.com\/\d+(?:\/[a-f0-9]+)?|player\.vimeo\.com\/video\/\d+)\/?(?:[?#][^\s]*)?$/.test(value);
}
