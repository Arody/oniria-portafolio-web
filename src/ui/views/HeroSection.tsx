import Link from 'next/link';
import { getSettings } from '@/core/services/settingsService';

export async function HeroSection() {
  const settings = await getSettings();

  return (
    <section id="inicio" className="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center bg-zinc-900 overflow-hidden border-b-4 border-black">
      {/* Background  */}
      {settings.hero_background_type === 'video' && settings.hero_background_url ? (
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
          <iframe
            src={`${settings.hero_background_url.replace('vimeo.com', 'player.vimeo.com/video')}?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1`}
            className="absolute top-1/2 left-1/2 w-[150vw] h-[150vh] -translate-x-1/2 -translate-y-1/2 object-cover"
            frameBorder="0"
            allow="autoplay; fullscreen"
          ></iframe>
        </div>
      ) : (
        <div
          className="absolute inset-0 z-0 opacity-50 bg-cover bg-center grayscale"
            style={{ backgroundImage: `url('${settings.hero_background_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=2560'}')` }}
          />
      )}
      
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-5xl mx-auto mt-20">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tighter leading-none mb-6 drop-shadow-lg brutalist-shadow" style={{ fontFamily: settings.heading_font || 'inherit' }}>
          {settings.hero_title}
        </h1>
        <p className="text-lg md:text-2xl text-gray-200 mb-10 max-w-2xl font-medium drop-shadow-md" style={{ fontFamily: settings.body_font || 'inherit' }}>
          {settings.hero_subtitle}
        </p>
        
        <Link 
          href="#portafolio" 
          className="bg-white text-black px-8 py-4 font-bold uppercase tracking-widest text-sm md:text-base brutalist-border-thick brutalist-shadow-hover"
          style={{ fontFamily: settings.heading_font || 'inherit' }}
        >
          VER PORTAFOLIO
        </Link>
      </div>
    </section>
  );
}
