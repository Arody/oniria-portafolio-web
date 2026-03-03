import { getSettings } from '@/core/services/settingsService';
import { NavbarClient } from './NavbarClient';
import type { Dictionary } from '@/lib/dictionaries';
import type { Locale } from '@/i18n.config';

interface NavbarProps {
  dict: Dictionary['navigation'];
  locale: Locale;
}

export async function Navbar({ dict, locale }: NavbarProps) {
  const settings = await getSettings();

  return (
    <NavbarClient
      logoText={settings.logo_text || 'ONIRIA.'}
      logoImageUrl={settings.logo_image_url}
      logoSize={settings.logo_size ?? 40}
      headingFont={settings.heading_font}
      dict={dict}
      locale={locale}
    />
  );
}
