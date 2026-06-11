'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { prefersReducedMotion } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

interface HeroPhilosophyProps {
  phrases: string[];
  children: React.ReactNode;
}

export function HeroPhilosophy({ phrases, children }: HeroPhilosophyProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pinnedContainerRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const phraseRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(() => {
    if (prefersReducedMotion()) return;

    // Target only the hero's inner text content and scroll cue (z-10 layers),
    // not the video background or gradients
    const heroTextLayers = heroContentRef.current
      ? Array.from(heroContentRef.current.querySelectorAll('.hero-text-content, .hero-scroll-cue'))
      : [];

    const master = gsap.timeline({
      scrollTrigger: {
        trigger: wrapperRef.current,
        start: 'top top',
        end: `+=${phrases.length * 100}vh`,
        pin: pinnedContainerRef.current,
        scrub: 1,
        anticipatePin: 1,
      },
    });

    // ── Fade out hero text softly ──
    if (heroTextLayers.length) {
      master.to(
        heroTextLayers,
        { opacity: 0, y: -20, duration: 0.12, ease: 'power1.inOut' },
        0
      );
    }

    // ── Each phrase: emerge from blur → hold → dissolve ──
    const phraseDuration = 0.85 / phrases.length; // distribute across 0.08–0.93

    phraseRefs.current.forEach((phrase, i) => {
      if (!phrase) return;
      const line = lineRefs.current[i];
      const start = 0.08 + i * phraseDuration;

      // Fade in — opacity + tiny y shift + focus pull from blur
      master.fromTo(
        phrase,
        { opacity: 0, y: 18, filter: 'blur(10px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: phraseDuration * 0.25, ease: 'power2.out' },
        start
      );

      // Line gently expands
      if (line) {
        master.fromTo(
          line,
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: phraseDuration * 0.2, ease: 'power1.inOut' },
          start + phraseDuration * 0.1
        );
      }

      // Fade out — soft dissolve back into blur
      master.to(
        phrase,
        { opacity: 0, y: -12, filter: 'blur(8px)', duration: phraseDuration * 0.25, ease: 'power1.in' },
        start + phraseDuration * 0.7
      );

      if (line) {
        master.to(
          line,
          { scaleX: 0, opacity: 0, duration: phraseDuration * 0.15, ease: 'power1.in' },
          start + phraseDuration * 0.68
        );
      }
    });

    // ── Bring hero text back at the end ──
    if (heroTextLayers.length) {
      master.to(
        heroTextLayers,
        { opacity: 1, y: 0, duration: 0.08, ease: 'power2.out' },
        0.93
      );
    }
  }, { dependencies: [phrases], scope: wrapperRef });

  return (
    <div ref={wrapperRef} className="relative">
      <div ref={pinnedContainerRef} className="relative w-full">
        {/* Hero — video + content, untouched */}
        <div ref={heroContentRef}>
          {children}
        </div>

        {/* Phrases float over the video, same position as the title */}
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          {phrases.map((phrase, i) => (
            <div
              key={i}
              ref={(el) => { phraseRefs.current[i] = el; }}
              className="absolute inset-0 flex flex-col items-center justify-center px-8 sm:px-12 md:px-20 opacity-0"
            >
              {/* Counter */}
              <span className="text-champagne/40 text-[10px] font-sans uppercase tracking-[0.4em] mb-5">
                {String(i + 1).padStart(2, '0')} / {String(phrases.length).padStart(2, '0')}
              </span>

              {/* Phrase */}
              <p className="text-ivory/90 text-lg sm:text-xl md:text-2xl lg:text-3xl font-serif font-light text-center leading-relaxed max-w-3xl tracking-wide">
                {phrase}
              </p>

              {/* Accent line */}
              <div
                ref={(el) => { lineRefs.current[i] = el; }}
                className="w-12 h-px bg-champagne/60 mt-6 origin-center"
                style={{ transform: 'scaleX(0)' }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
