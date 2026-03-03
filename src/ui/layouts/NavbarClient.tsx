'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import type { Dictionary } from '@/lib/dictionaries';
import type { Locale } from '@/i18n.config';

interface NavbarClientProps {
  logoText: string;
  logoImageUrl: string | null;
  logoSize: number;
  headingFont: string | null;
  dict?: Dictionary['navigation'];
  locale?: Locale;
}

export function NavbarClient({ logoText, logoImageUrl, logoSize, headingFont, dict, locale }: NavbarClientProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loc = locale || 'es';
  const navLinks = [
    { href: `/${loc}`, label: dict?.home || 'Inicio' },
    { href: `/${loc}#portafolio`, label: dict?.our_work || 'Portafolio' },
    { href: `/${loc}/blog`, label: dict?.blog || 'Blog' },
    { href: `/${loc}#contacto`, label: dict?.contact || 'Contacto' },
  ];

  // Dynamic logo size — shrink when contracted
  const dynamicLogoSize = scrolled ? Math.max(logoSize * 0.55, 16) : logoSize;

  return (
    <nav
      className={`fixed z-50 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        scrolled
        ? 'top-3 left-1/2 -translate-x-1/2 w-auto max-w-[92vw] md:max-w-fit'
        : 'top-0 left-0 w-full translate-x-0'
      }`}
    >
      <div
        className={`transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${scrolled
          ? 'bg-obsidian/75 backdrop-blur-2xl border border-white/[0.06] rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.4)] px-4 md:px-6 py-1.5'
          : 'bg-transparent border border-transparent px-6 sm:px-8 lg:px-12 py-4'
          }`}
      >
        <div
          className={`flex justify-between items-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${scrolled ? 'min-h-0 gap-4 md:gap-6' : 'min-h-[5rem] max-w-7xl mx-auto'
            }`}
        >
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center h-full">
            <Link href={`/${loc}`} className="h-full flex items-center group">
              {logoImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoImageUrl}
                  alt={logoText}
                  style={{ height: `${dynamicLogoSize}px` }}
                  className="w-auto object-contain brightness-0 invert transition-all duration-700 group-hover:opacity-80"
                />
              ) : (
                <span
                    className={`font-light uppercase text-ivory transition-all duration-700 group-hover:text-champagne ${scrolled ? 'tracking-[0.15em]' : 'tracking-[0.25em]'
                      }`}
                    style={{ fontFamily: headingFont || 'inherit', fontSize: `${dynamicLogoSize}px` }}
                >
                  {logoText}
                </span>
              )}
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className={`hidden md:flex items-center transition-all duration-700 ${scrolled ? 'space-x-4 lg:space-x-5' : 'space-x-6 lg:space-x-10'}`}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`uppercase font-light transition-all duration-500 hover:text-champagne whitespace-nowrap ${scrolled
                    ? 'text-[9px] tracking-[0.14em] text-ivory/60'
                    : 'text-xs tracking-[0.2em] text-mist'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={`md:hidden transition-all duration-500 ${scrolled ? 'text-ivory/70 hover:text-champagne' : 'text-ivory hover:text-champagne'
              }`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={scrolled ? 20 : 24} /> : <Menu size={scrolled ? 20 : 24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu — drops below the island */}
      <div
        className={`md:hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden ${menuOpen ? 'max-h-80 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'
        }`}
      >
        <div
          className={`border border-ivory/[0.08] backdrop-blur-2xl bg-obsidian/80 px-6 py-5 space-y-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] ${scrolled ? 'rounded-2xl mx-0' : 'rounded-2xl mx-4'
            }`}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block text-mist hover:text-champagne uppercase text-sm tracking-[0.2em] font-light transition-colors duration-400 py-2"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
