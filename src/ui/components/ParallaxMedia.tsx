'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { getParallaxOffset, prefersReducedMotion } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

export function ParallaxMedia({ children }: { children: React.ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const frame = frameRef.current;
    if (!frame || prefersReducedMotion()) return;

    gsap.fromTo(mediaRef.current,
      { y: () => -getParallaxOffset(frame.offsetHeight) },
      {
        y: () => getParallaxOffset(frame.offsetHeight),
        ease: 'none',
        scrollTrigger: {
          trigger: frame.closest('[data-hero-scroll]') || frame,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
  }, { scope: frameRef });

  return (
    <div ref={frameRef} data-parallax-frame className="absolute inset-0 overflow-hidden">
      <div ref={mediaRef} data-parallax-media className="absolute inset-x-0 -inset-y-[35%] overflow-hidden will-change-transform [container-type:size] motion-reduce:inset-y-0 motion-reduce:will-change-auto">
        {children}
      </div>
    </div>
  );
}
