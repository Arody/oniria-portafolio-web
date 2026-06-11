import Link from 'next/link';
import { ScrollReveal } from '@/ui/components/ScrollReveal';
import type { Dictionary } from '@/lib/dictionaries';
import type { Locale } from '@/i18n.config';
import { getSettings } from '@/core/services/settingsService';

interface FooterProps {
  dict: Dictionary['footer'];
  navDict?: Dictionary['navigation'];
  locale: Locale;
}

export async function Footer({ dict, locale, navDict }: FooterProps) {
  const settings = await getSettings();
  const logoText = settings.logo_text || 'ONIRIA.';
  const logoImageUrl = settings.logo_image_url;
  const logoSize = settings.logo_size || 24;
  const headingFont = settings.heading_font;

  return (
    <footer className="bg-obsidian relative py-16">
      {/* Top champagne divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-champagne/30 to-transparent" />

      <ScrollReveal y={28} start="top 95%" className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div className="mb-8 md:mb-0 flex-shrink-0 flex items-center">
            {logoImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoImageUrl}
                alt={logoText}
                style={{ height: `${Math.max(logoSize * 0.8, 20)}px` }}
                className="w-auto object-contain brightness-0 invert"
              />
            ) : (
              <span 
                className="font-light tracking-[0.25em] text-ivory uppercase"
                style={{ fontFamily: headingFont || 'inherit', fontSize: `${Math.max(logoSize * 0.8, 20)}px` }}
              >
                {logoText}
              </span>
            )}
          </div>

          <div className="flex space-x-10 mb-8 md:mb-0">
            <Link href={`/${locale}`} className="text-mist/50 hover:text-champagne uppercase text-[10px] tracking-[0.2em] font-sans transition-colors duration-400">
              {navDict ? 'Inicio' : 'Inicio'}
            </Link>
            <Link href={`/${locale}#portafolio`} className="text-mist/50 hover:text-champagne uppercase text-[10px] tracking-[0.2em] font-sans transition-colors duration-400">
              {navDict?.our_work || 'Portafolio'}
            </Link>
            <Link href={`/${locale}/blog`} className="text-mist/50 hover:text-champagne uppercase text-[10px] tracking-[0.2em] font-sans transition-colors duration-400">
              {navDict?.blog || 'Blog'}
            </Link>
            <Link href={`/${locale}#contacto`} className="text-mist/50 hover:text-champagne uppercase text-[10px] tracking-[0.2em] font-sans transition-colors duration-400">
              {navDict?.contact || 'Contacto'}
            </Link>
          </div>

          <div className="flex space-x-8">
            <a href="https://instagram.com/oniriaweddingfilms" target="_blank" rel="noopener noreferrer" className="text-mist/40 hover:text-champagne text-[10px] uppercase tracking-[0.2em] font-sans transition-colors duration-400">Instagram</a>
          </div>
        </div>

        {/* Bottom divider */}
        <div className="h-px bg-graphite/50 mb-8" />

        <p className="text-center text-mist/25 text-[10px] font-sans tracking-[0.15em] uppercase">
          © {new Date().getFullYear()} Oniria Wedding Films. {dict?.rights || 'All rights reserved.'}
        </p>
      </ScrollReveal>
    </footer>
  );
}
