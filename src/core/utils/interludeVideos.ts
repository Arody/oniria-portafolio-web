import { isAboutVimeoUrl } from './aboutContent.ts';

export function interludeVideos(urls?: string[] | null, legacyUrl?: string | null) {
  return [...new Set((urls ?? [legacyUrl ?? '']).map(url => url.trim()).filter(isAboutVimeoUrl))].slice(0, 5);
}

export function chooseInterludeVideo(urls: string[], previous: string | null, random = Math.random) {
  const choices = urls.length > 1 ? urls.filter(url => url !== previous) : urls;
  return choices[Math.floor(random() * choices.length)] ?? '';
}
