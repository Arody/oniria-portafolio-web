'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { prefersReducedMotion } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: React.ReactNode;
  /** Vertical offset (px) the content rises from */
  y?: number;
  /** Delay in seconds before the reveal starts */
  delay?: number;
  /** When set, direct children are revealed one by one with this stagger (s) */
  stagger?: number;
  /** ScrollTrigger start position */
  start?: string;
  className?: string;
}

/**
 * Wraps server-rendered content and reveals it when it scrolls into view.
 * Lets server components (BlogSection, Footer, …) get scroll-triggered
 * entrances without converting them to client components.
 */
export function ScrollReveal({
  children,
  y = 48,
  delay = 0,
  stagger,
  start = 'top 85%',
  className,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;

    const targets = stagger ? Array.from(el.children) : el;
    if (stagger && (targets as Element[]).length === 0) return;

    // fromTo with explicit end values — gsap.from() captures the current
    // value as the end state, which gets corrupted when a target has a CSS
    // `transition` and React strict mode double-runs the effect
    gsap.fromTo(targets,
      { y, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        delay,
        stagger: stagger ?? 0,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start,
          toggleActions: 'play none none reverse',
        },
      });
  }, { scope: ref });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
