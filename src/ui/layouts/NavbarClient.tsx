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

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out ${
        scrolled
          ? 'oniria-glass border-b border-graphite/30'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center min-h-[5rem] py-4">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center h-full">
            <Link href="/" className="h-full flex items-center group">
              {logoImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoImageUrl}
                  alt={logoText}
                  style={{ height: `${logoSize}px` }}
                  className="w-auto object-contain brightness-0 invert transition-opacity duration-400 group-hover:opacity-80"
                />
              ) : (
                <span
                  className="font-light tracking-[0.25em] uppercase text-ivory transition-colors duration-400 group-hover:text-champagne"
                  style={{ fontFamily: headingFont || 'inherit', fontSize: `${logoSize}px` }}
                >
                  {logoText}
                </span>
              )}
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-mist hover:text-champagne uppercase text-xs tracking-[0.2em] font-light transition-colors duration-400"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-ivory hover:text-champagne transition-colors duration-300"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-500 ease-in-out overflow-hidden ${
          menuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="oniria-glass border-t border-graphite/30 px-6 py-6 space-y-4">
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
