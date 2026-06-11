'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { prefersReducedMotion } from '@/lib/motion';

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
    // Hold hero entrance animations (`.splash-wait`) until the curtain lifts
    document.documentElement.classList.add('splash-active');
    // Prevent scroll during splash
    document.body.style.overflow = 'hidden';

    if (prefersReducedMotion()) {
      document.documentElement.classList.remove('splash-active');
      document.body.style.overflow = '';
      setDone(true);
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = '';
        setDone(true);
      },
    });

    // 1. Logo emerges from blur + scales from 0.85 → 1
    tl.fromTo(
      logoRef.current,
      { opacity: 0, scale: 0.85, filter: 'blur(14px)' },
      { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.4, ease: 'power3.out' }
    );

    // 2. Gold line expands
    tl.fromTo(
      lineRef.current,
      { scaleX: 0, opacity: 0 },
      { scaleX: 1, opacity: 1, duration: 0.8, ease: 'power2.inOut' },
      '-=0.5'
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

    // 5. Logo dissolves upward into blur, curtain lifts
    tl.to(
      [logoRef.current, lineRef.current, glowRef.current],
      { opacity: 0, scale: 1.4, filter: 'blur(10px)', duration: 0.8, ease: 'power3.in' }
    );

    // Release the hero entrance right as the curtain starts lifting,
    // so its animations play while being revealed
    tl.add(() => document.documentElement.classList.remove('splash-active'), '-=0.4');

    tl.to(
      containerRef.current,
      { yPercent: -100, duration: 0.9, ease: 'power4.inOut' },
      '<'
    );

    return () => {
      document.body.style.overflow = '';
      document.documentElement.classList.remove('splash-active');
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
