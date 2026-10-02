'use client';

import { useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { prefersReducedMotion } from '@/lib/motion';

export function FilmGrid({ count, label, hint, children }: {
  count: number;
  label: string;
  hint: string;
  children: (index: number) => ReactNode;
}) {
  const grid = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!grid.current || prefersReducedMotion()) return;
    const columns = getComputedStyle(grid.current).gridTemplateColumns.split(' ').length;
    gsap.fromTo(grid.current.children, {
      y: (index: number) => (index % columns === 1 ? -1 : 1) * 240,
      autoAlpha: 0,
      scale: 0.94,
    }, {
      y: 0, autoAlpha: 1, scale: 1,
      duration: 1.7,
      delay: (index: number) => (index % columns) * 0.13,
      ease: 'power3.out',
      clearProps: 'transform,opacity,visibility',
    });
  }, { scope: grid, dependencies: [count], revertOnUpdate: true });

  return (
    <div>
      <p className="mb-5 text-center text-mist/50 text-[10px] uppercase tracking-[0.2em]">{hint}</p>
      <div ref={grid} role="region" aria-label={label} data-film-grid
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
        {Array.from({ length: count }, (_, index) => (
          <div key={index} data-film-tile>{children(index)}</div>
        ))}
      </div>
    </div>
  );
}
