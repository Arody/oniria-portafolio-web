import { ogImages } from './ogImages.ts';
import type { Metadata } from 'next';

export const SITE_URL = 'https://oniriaweddings.com';

export function pageMetadata({ locale, path = '', title, description, image, publishedTime }: {
  locale: string;
  path?: string;
  title: string;
  description: string;
  image?: string | null;
  publishedTime?: string;
}): Metadata {
  const url = `${SITE_URL}/${locale}${path}`;
  const localImage = ogImages[image || ''] || ogImages['/interludes/veil.png'];
  const images = [{ url: `${SITE_URL}${localImage}`, width: 1200, height: 630, type: 'image/jpeg', alt: title }];
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: { es: `${SITE_URL}/es${path}`, en: `${SITE_URL}/en${path}`, 'x-default': `${SITE_URL}/es${path}` },
    },
    openGraph: {
      title, description, url, images,
      siteName: 'ONIRIA Wedding Films',
      locale: locale === 'es' ? 'es_MX' : 'en_US',
      ...(publishedTime ? { type: 'article', publishedTime, authors: ['ONIRIA'] } : { type: 'website' }),
    },
    twitter: { card: 'summary_large_image', title, description, images },
  };
}
