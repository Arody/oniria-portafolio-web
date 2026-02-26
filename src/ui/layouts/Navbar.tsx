import Link from 'next/link';
import { getSettings } from '@/core/services/settingsService';

export async function Navbar() {
  const settings = await getSettings();

  return (
    <nav className="fixed top-0 left-0 w-full bg-white z-50 border-b border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center h-full py-4">
            <Link href="/" className="h-full flex items-center">
              {settings.logo_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={settings.logo_image_url} alt={settings.logo_text || 'Oniria Logo'} className="max-h-full w-auto object-contain mix-blend-multiply" />
              ) : (
                <span className="text-2xl font-bold tracking-tighter uppercase" style={{ fontFamily: settings.heading_font || 'inherit' }}>
                  {settings.logo_text || 'ONIRIA WEDDINGS'}
                </span>
              )}
            </Link>
          </div>
          <div className="hidden md:flex space-x-8">
            <Link href="/#inicio" className="text-black hover:underline uppercase text-sm font-semibold">
              Inicio
            </Link>
            <Link href="/#portafolio" className="text-black hover:underline uppercase text-sm font-semibold">
              Portafolio
            </Link>
            <Link href="/#blog" className="text-black hover:underline uppercase text-sm font-semibold">
              Blog
            </Link>
            <Link href="/#contacto" className="text-black hover:underline uppercase text-sm font-semibold">
              Contacto
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
