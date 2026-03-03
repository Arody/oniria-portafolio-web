import type { Locale } from '@/i18n.config';

const dictionaries = {
  es: () => import('./dictionaries/es.json').then((module) => module.default),
  en: () => import('./dictionaries/en.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale]?.() ?? dictionaries.es();
};

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
