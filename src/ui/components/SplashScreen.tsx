'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface SplashScreenProps {
  logoImageUrl: string | null;
  logoText: string;
  headingFont: string | null;
}

export function SplashScreen({ logoImageUrl, logoText, headingFont }: SplashScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useGSAP(() => {
    // Prevent scroll during splash
    document.body.style.overflow = 'hidden';

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = '';
        setDone(true);
      },
    });

    // 1. Logo fades in + scales from 0.7 → 1
    tl.fromTo(
      logoRef.current,
      { opacity: 0, scale: 0.7 },
      { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out' }
    );

    // 2. Gold line expands
    tl.fromTo(
      lineRef.current,
      { scaleX: 0, opacity: 0 },
      { scaleX: 1, opacity: 1, duration: 0.8, ease: 'power2.inOut' },
      '-=0.3'
    );

    // 3. Ambient glow pulse
    tl.fromTo(
      glowRef.current,
      { opacity: 0, scale: 0.5 },
      { opacity: 0.4, scale: 1.2, duration: 1, ease: 'power2.out' },
      '-=0.8'
    );

    // 4. Hold briefly
    tl.to({}, { duration: 0.4 });

    // 5. Logo scales up + fades, curtain lifts
    tl.to(
      [logoRef.current, lineRef.current, glowRef.current],
      { opacity: 0, scale: 1.5, duration: 0.8, ease: 'power3.in' }
    );

    tl.to(
      containerRef.current,
      { yPercent: -100, duration: 0.9, ease: 'power4.inOut' },
      '-=0.4'
    );

    return () => {
      document.body.style.overflow = '';
    };
  }, { scope: containerRef });

  if (done) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-obsidian"
    >
      {/* Ambient glow behind logo */}
      <div
        ref={glowRef}
        className="absolute w-64 h-64 rounded-full opacity-0"
        style={{
          background: 'radial-gradient(circle, rgba(198,165,110,0.15) 0%, transparent 70%)',
        }}
      />

      {/* Logo + line container */}
      <div className="flex flex-col items-center gap-4">
        <div ref={logoRef} className="opacity-0">
          {logoImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoImageUrl}
              alt={logoText}
              className="h-16 sm:h-20 md:h-24 w-auto object-contain brightness-0 invert"
            />
          ) : (
            <span
              className="font-light uppercase text-ivory tracking-[0.3em] text-4xl sm:text-5xl md:text-6xl"
              style={{ fontFamily: headingFont || 'inherit' }}
            >
              {logoText}
            </span>
          )}
        </div>

        {/* Gold accent line */}
        <div
          ref={lineRef}
          className="w-16 h-[1px] bg-champagne opacity-0 origin-center"
        />
      </div>
    </div>
  );
}
