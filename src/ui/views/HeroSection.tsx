import { getSettings } from '@/core/services/settingsService';
import { ParallaxMedia } from '@/ui/components/ParallaxMedia';

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

export async function HeroSection({ locale }: { locale: string }) {
  const settings = await getSettings(locale);
  const showText = settings.hero_text_enabled !== false;

  return (
    <section id="inicio" className="relative w-full h-screen min-h-[700px] flex items-center justify-center bg-obsidian overflow-hidden">
      <ParallaxMedia>
      {settings.hero_background_type === 'video' && settings.hero_background_url ? (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <iframe
            title="Oniria Wedding Films"
            src={buildVimeoEmbedUrl(settings.hero_background_url)}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[max(100cqw,177.78cqh)] h-[max(100cqh,56.25cqw)]"
            frameBorder="0"
            allow="autoplay; fullscreen"
          ></iframe>
        </div>
      ) : (
        <div
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${settings.hero_background_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=2560'}')` }}
          />
      )}

      </ParallaxMedia>

      <div aria-hidden="true" className="hero-overlay absolute inset-0 z-[1] bg-black pointer-events-none" style={{ opacity: (settings.hero_overlay_opacity ?? 50) / 100 }} />

      {showText ? (
        <>
          <div className="hero-text-content relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto">
            {/* Subtle top accent line */}
            <div className="w-12 h-px bg-champagne mb-10 origin-center animate-line-grow splash-wait" />

            <h1
              className="text-4xl md:text-6xl lg:text-7xl font-serif font-light text-ivory uppercase tracking-[0.15em] leading-[1.1] mb-8 animate-blur-up animation-delay-200 splash-wait"
              style={{ fontFamily: settings.heading_font || 'inherit' }}
            >
              {settings.hero_title}
            </h1>

            <p
              className="text-base md:text-lg text-mist/80 mb-12 max-w-xl font-light tracking-[0.1em] uppercase animate-blur-up animation-delay-400 splash-wait"
              style={{ fontFamily: settings.body_font || 'inherit' }}
            >
              {settings.hero_subtitle}
            </p>

          </div>

          {/* Scroll cue — animated champagne line */}
          <div className="hero-scroll-cue absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
            <div className="animate-fade-in animation-delay-1000 splash-wait">
              <div className="w-px h-12 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-b from-champagne/70 via-champagne/40 to-transparent animate-scroll-cue" />
              </div>
            </div>
          </div>

        </>
      ) : (
        <h1 className="sr-only">{settings.site_title}</h1>
      )}
    </section>
  );
}
