import Link from 'next/link';
import { getSettings } from '@/core/services/settingsService';

export async function HeroSection() {
  const settings = await getSettings();

  return (
    <section id="inicio" className="relative w-full h-screen min-h-[700px] flex items-center justify-center bg-obsidian overflow-hidden">
      {/* Background  */}
      {settings.hero_background_type === 'video' && settings.hero_background_url ? (
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <iframe
            src={`${settings.hero_background_url.replace('vimeo.com', 'player.vimeo.com/video')}?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1`}
            className="absolute top-1/2 left-1/2 w-[150vw] h-[150vh] -translate-x-1/2 -translate-y-1/2 object-cover"
            frameBorder="0"
            allow="autoplay; fullscreen"
          ></iframe>
        </div>
      ) : (
        <div
            className="absolute inset-0 z-0 opacity-30 bg-cover bg-center"
            style={{ backgroundImage: `url('${settings.hero_background_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=2560'}')` }}
          />
      )}

      {/* Gradient overlay for cinematic depth */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-obsidian/60 via-transparent to-obsidian/90" />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto">
        {/* Subtle top accent line */}
        <div className="w-12 h-px bg-champagne mb-10 animate-fade-in" />

        <h1
          className="text-5xl md:text-7xl lg:text-[6rem] font-serif font-light text-ivory uppercase tracking-[0.15em] leading-[1.1] mb-8 animate-fade-up"
          style={{ fontFamily: settings.heading_font || 'inherit' }}
        >
          {settings.hero_title}
        </h1>

        <p
          className="text-base md:text-lg text-mist/80 mb-12 max-w-xl font-light tracking-[0.1em] uppercase animate-fade-up animation-delay-200"
          style={{ fontFamily: settings.body_font || 'inherit' }}
        >
          {settings.hero_subtitle}
        </p>
        
        <Link 
          href="#portafolio" 
          className="group relative bg-transparent text-ivory px-10 py-4 font-sans uppercase tracking-[0.3em] text-xs border border-ivory/30 hover:border-champagne hover:text-champagne transition-all duration-500 animate-fade-up animation-delay-400"
          style={{ fontFamily: settings.body_font || 'inherit' }}
        >
          Watch the story
          <span className="absolute bottom-0 left-0 w-0 h-px bg-champagne transition-all duration-500 group-hover:w-full" />
        </Link>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-obsidian to-transparent z-[2]" />
    </section>
  );
}
