import Link from 'next/link';
import { getSettings } from '@/core/services/settingsService';

/**
 * Build a Vimeo background-mode embed URL from any Vimeo link format:
 *   - https://vimeo.com/1115617212
 *   - https://player.vimeo.com/video/1115617212?h=6c5a3354ba
 *   - https://vimeo.com/1115617212/6c5a3354ba
 */
function buildVimeoEmbedUrl(raw: string): string {
  // Extract the video ID (sequence of digits after /video/ or after vimeo.com/)
  const idMatch = raw.match(/(?:vimeo\.com\/(?:video\/)?)(\d+)/);
  const videoId = idMatch?.[1];
  if (!videoId) return raw; // fallback — return as-is

  // Extract optional hash token (h= param or path segment after ID)
  const hashFromParam = raw.match(/[?&]h=([a-f0-9]+)/)?.[1];
  const hashFromPath = raw.match(new RegExp(`${videoId}/([a-f0-9]+)`))?.[1];
  const hash = hashFromParam || hashFromPath;

  let url = `https://player.vimeo.com/video/${videoId}?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1`;
  if (hash) url += `&h=${hash}`;
  return url;
}

export async function HeroSection() {
  const settings = await getSettings();

  return (
    <section id="inicio" className="relative w-full h-screen min-h-[700px] flex items-center justify-center bg-obsidian overflow-hidden">
      {/* Background  */}
      {settings.hero_background_type === 'video' && settings.hero_background_url ? (
        <div className="absolute inset-0 z-0 opacity-50 pointer-events-none overflow-hidden">
          <iframe
            src={buildVimeoEmbedUrl(settings.hero_background_url)}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[177.78vh] min-w-full h-[56.25vw] min-h-full"
            frameBorder="0"
            allow="autoplay; fullscreen"
          ></iframe>
        </div>
      ) : (
        <div
            className="absolute inset-0 z-0 opacity-50 bg-cover bg-center"
            style={{ backgroundImage: `url('${settings.hero_background_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=2560'}')` }}
          />
      )}

      {/* Gradient overlay — only darken bottom for cinematic transition, top stays clear */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-obsidian/20 to-obsidian/90" />

      <div className="hero-text-content relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto">
        {/* Subtle top accent line */}
        <div className="w-12 h-px bg-champagne mb-10 animate-fade-in" />

        <h1
          className="text-4xl md:text-6xl lg:text-7xl font-serif font-light text-ivory uppercase tracking-[0.15em] leading-[1.1] mb-8 animate-fade-up"
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
