'use client';

import { useRouter } from 'next/navigation';
import type { Locale } from '@/i18n.config';
import { localizedHref } from '@/core/utils/localization';

export function LanguageSelector({ locale, label }: { locale: Locale; label: string }) {
  const router = useRouter();
  return <select
    aria-label={label}
    value={locale}
    className="cursor-pointer rounded-none border-b border-champagne/40 bg-transparent py-2 text-xs text-mist focus-visible:outline-2 focus-visible:outline-champagne"
    onChange={event => {
      const next = event.target.value as Locale;
      document.cookie = `oniria_locale=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
      router.push(localizedHref(window.location.pathname + window.location.search + window.location.hash, next));
    }}
  >
    <option value="es" lang="es" className="bg-obsidian">es</option>
    <option value="en" lang="en" className="bg-obsidian">en</option>
  </select>;
}
