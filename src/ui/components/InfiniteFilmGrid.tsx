'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { getFilmLoopSize, wrapFilmScroll } from '@/core/utils/filmScroll';
import { prefersReducedMotion } from '@/lib/motion';

export function InfiniteFilmGrid({ count, label, hint, children }: {
  count: number;
  label: string;
  hint: string;
  children: (index: number, duplicate: boolean) => ReactNode;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const cycle = useRef<HTMLDivElement>(null);
  const entered = useRef(false);
  const [layout, setLayout] = useState({ columns: 1, rows: 1, ready: false });
  const size = getFilmLoopSize(count, layout.columns, layout.rows);

  useEffect(() => {
    const track = viewport.current;
    const grid = cycle.current;
    if (!track || !grid) return;
    const observer = new ResizeObserver(() => {
      const style = getComputedStyle(grid);
      const columns = style.gridTemplateColumns.split(' ').length;
      const gap = parseFloat(style.rowGap) || 0;
      const cardWidth = (grid.clientWidth - gap * (columns - 1)) / columns;
      const rows = Math.ceil(track.clientHeight / (cardWidth * 9 / 16 + gap));
      setLayout(previous => previous.columns === columns && previous.rows === rows && previous.ready
        ? previous : { columns, rows, ready: true });
    });
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const track = viewport.current;
    const grid = cycle.current;
    if (!track || !grid || !layout.ready) return;
    const height = grid.getBoundingClientRect().height;
    track.scrollTop = height;
    const wrap = () => {
      // Leave room above the first card for the browser to focus it without recycling it.
      if (track.scrollTop >= height / 2 && track.scrollTop < height * 2) return;
      const next = wrapFilmScroll(track.scrollTop, height);
      if (Math.abs(next - track.scrollTop) > 1) track.scrollTop = next;
    };
    track.addEventListener('scroll', wrap, { passive: true });
    return () => track.removeEventListener('scroll', wrap);
  }, [layout, size]);

  useGSAP(() => {
    if (!layout.ready || entered.current) return;
    entered.current = true;
    if (prefersReducedMotion()) return;
    const tiles = viewport.current?.querySelectorAll('[data-film-tile]');
    if (!tiles) return;
    gsap.fromTo(tiles, {
      y: (index: number) => (index % layout.columns === 1 ? -1 : 1) * 240,
      autoAlpha: 0,
      scale: 0.94,
    }, {
      y: 0, autoAlpha: 1, scale: 1,
      duration: 1.7,
      delay: (index: number) => (index % layout.columns) * 0.13,
      ease: 'power3.out',
      clearProps: 'transform,opacity,visibility',
    });
  }, { scope: viewport, dependencies: [layout] });

  return (
    <div>
      <p className="mb-5 text-center text-mist/50 text-[10px] uppercase tracking-[0.2em]">{hint}</p>
      <div
        ref={viewport}
        role="region"
        aria-label={label}
        tabIndex={0}
        data-film-loop
        className="h-[calc(100svh-15rem)] min-h-80 overflow-y-auto overscroll-y-contain [overflow-anchor:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:outline-2 focus-visible:outline-champagne"
      >
        {[0, 1, 2].map(copy => (
          <div
            key={copy}
            ref={copy === 1 ? cycle : undefined}
            data-film-cycle
            aria-hidden={copy !== 1 || undefined}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-4"
          >
            {Array.from({ length: size }, (_, index) => (
              <div key={index} data-film-tile>
                {children(copy * size + index, copy !== 1 || index >= count)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
