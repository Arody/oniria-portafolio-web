import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-obsidian relative py-16">
      {/* Top champagne divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-champagne/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div className="mb-8 md:mb-0">
            <span className="text-xl font-serif font-light tracking-[0.2em] text-ivory uppercase">ONIRIA.</span>
          </div>

          <div className="flex space-x-10 mb-8 md:mb-0">
            <Link href="/#inicio" className="text-mist/50 hover:text-champagne uppercase text-[10px] tracking-[0.2em] font-sans transition-colors duration-400">Inicio</Link>
            <Link href="/#portafolio" className="text-mist/50 hover:text-champagne uppercase text-[10px] tracking-[0.2em] font-sans transition-colors duration-400">Portafolio</Link>
            <Link href="/#blog" className="text-mist/50 hover:text-champagne uppercase text-[10px] tracking-[0.2em] font-sans transition-colors duration-400">Blog</Link>
            <Link href="/#contacto" className="text-mist/50 hover:text-champagne uppercase text-[10px] tracking-[0.2em] font-sans transition-colors duration-400">Contacto</Link>
          </div>

          <div className="flex space-x-8">
            <a href="#" className="text-mist/40 hover:text-champagne text-[10px] uppercase tracking-[0.2em] font-sans transition-colors duration-400">Instagram</a>
            <a href="#" className="text-mist/40 hover:text-champagne text-[10px] uppercase tracking-[0.2em] font-sans transition-colors duration-400">Pinterest</a>
            <a href="#" className="text-mist/40 hover:text-champagne text-[10px] uppercase tracking-[0.2em] font-sans transition-colors duration-400">Facebook</a>
          </div>
        </div>

        {/* Bottom divider */}
        <div className="h-px bg-graphite/50 mb-8" />

        <p className="text-center text-mist/25 text-[10px] font-sans tracking-[0.15em] uppercase">
          © {new Date().getFullYear()} Oniria Wedding Films. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
