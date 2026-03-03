import { getSettings } from '@/core/services/settingsService';
import { NavbarClient } from './NavbarClient';

export async function Navbar() {
  const settings = await getSettings();

  return (
    <NavbarClient
      logoText={settings.logo_text || 'ONIRIA.'}
      logoImageUrl={settings.logo_image_url}
      logoSize={settings.logo_size ?? 40}
      headingFont={settings.heading_font}
    />
  );
}
