'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { X, Play } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { PortfolioProject } from '@/core/services/portfolioService';
import type { Dictionary } from '@/lib/dictionaries';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Dynamically import Vimeo player to avoid SSR issues
const Vimeo = dynamic(() => import('@u-wave/react-vimeo'), { ssr: false });

/* ─────────────────────────────────────────────
   Masonry size assignment based on index
   Creates visual rhythm: large → small → medium → small → medium → large …
   ───────────────────────────────────────────── */
type CardSize = 'large' | 'medium' | 'small';

const SIZE_PATTERN: CardSize[] = ['large', 'small', 'medium', 'small', 'medium', 'large'];

function getCardSize(index: number): CardSize {
  return SIZE_PATTERN[index % SIZE_PATTERN.length];
}

/** CSS grid span classes per size */
const sizeClasses: Record<CardSize, string> = {
  large:  'md:col-span-2 md:row-span-2',
  medium: 'md:col-span-1 md:row-span-2',
  small:  'md:col-span-1 md:row-span-1',
};

/** Aspect ratio classes per size */
const aspectClasses: Record<CardSize, string> = {
  large:  'aspect-[4/5]',
  medium: 'aspect-[3/4]',
  small:  'aspect-[4/3]',
};

/* ─────────────────────────────────────────────
   Parallax speed multiplier — larger cards move slower
   giving a depth/3D perception on scroll
   ───────────────────────────────────────────── */
const parallaxSpeed: Record<CardSize, number> = {
  large:  30,
  medium: 50,
  small:  70,
};

/* ─────────────────────────────────────────────
   Component
   ───────────────────────────────────────────── */

interface PortfolioSectionProps {
  projects: PortfolioProject[];
  dict: Dictionary['portfolio'];
}

export function PortfolioSection({ projects, dict }: PortfolioSectionProps) {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [activeProjectData, setActiveProjectData] = useState<PortfolioProject | null>(null);

  // Refs
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* ═══════════════════════════════════════════
     1. HEADER TEXT SPLIT ANIMATION
     Each character of "HISTORIAS" reveals individually
     with a staggered timeline
     ═══════════════════════════════════════════ */
  useEffect(() => {
    const ctx = gsap.context(() => {
      // --- Master timeline for header ---
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: headerRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      // Subtitle fade up
      tl.from(subtitleRef.current, {
        y: 14,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
      });

      // Title — simple fade up
      tl.from(titleRef.current, {
        y: 24,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
      }, '-=0.4');

      // Decorative line scale in
      tl.from(lineRef.current, {
        scaleX: 0,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
      }, '-=0.5');

      // --- Header parallax on scroll ---
      gsap.to(headerRef.current, {
        y: -80,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: headerRef.current,
          start: 'top 20%',
          end: 'top -20%',
          scrub: 1,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  /* ═══════════════════════════════════════════
     2. MASONRY CARDS — REVEAL ON SCROLL + PARALLAX
     Each card fades in with stagger and has
     independent parallax speed based on size
     ═══════════════════════════════════════════ */
  useEffect(() => {
    if (!projects.length) return;

    const ctx = gsap.context(() => {
      const cards = cardRefs.current.filter(Boolean) as HTMLElement[];

      // --- Per-card reveal from sides + parallax ---
      cards.forEach((card, i) => {
        const size = getCardSize(i);
        const speed = parallaxSpeed[size];
        // Alternate sides: even from left, odd from right
        const fromX = i % 2 === 0 ? -80 : 80;

        gsap.from(card, {
          x: fromX,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        });

        // Per-card parallax based on size
        gsap.to(card, {
          y: -speed,
          ease: 'none',
          scrollTrigger: {
            trigger: card,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          },
        });

        // Inner image parallax (Ken Burns feel)
        const img = card.querySelector('.card-image');
        if (img) {
          gsap.to(img, {
            y: speed * 0.4,
            scale: 1.08,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.5,
            },
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [projects]);

  /* ═══════════════════════════════════════════
     3. MAGNETIC HOVER EFFECT
     Card tilts subtly toward the cursor position
     with a smooth GSAP tween
     ═══════════════════════════════════════════ */
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const card = cardRefs.current[index];
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Normalize to -1…1
    const xNorm = (x / rect.width - 0.5) * 2;
    const yNorm = (y / rect.height - 0.5) * 2;

    gsap.to(card, {
      rotateY: xNorm * 6,
      rotateX: -yNorm * 6,
      x: xNorm * 8,
      y: yNorm * 8,
      scale: 1.02,
      duration: 0.4,
      ease: 'power2.out',
      overwrite: 'auto',
    });

    // Move the inner overlay glow toward cursor
    const glow = card.querySelector('.magnetic-glow');
    if (glow) {
      gsap.to(glow, {
        opacity: 1,
        x: xNorm * 30,
        y: yNorm * 30,
        duration: 0.4,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }
  }, []);

  const handleMouseLeave = useCallback((index: number) => {
    const card = cardRefs.current[index];
    if (!card) return;

    gsap.to(card, {
      rotateY: 0,
      rotateX: 0,
      x: 0,
      y: 0,
      scale: 1,
      duration: 0.6,
      ease: 'elastic.out(1, 0.5)',
      overwrite: 'auto',
    });

    const glow = card.querySelector('.magnetic-glow');
    if (glow) {
      gsap.to(glow, {
        opacity: 0,
        x: 0,
        y: 0,
        duration: 0.6,
        overwrite: 'auto',
      });
    }
  }, []);

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */
  return (
    <section
      ref={sectionRef}
      id="portafolio"
      className="py-28 bg-obsidian relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">

        {/* ── Animated Header ── */}
        <div ref={headerRef} className="mb-24 text-center">
          <p
            ref={subtitleRef}
            className="text-champagne text-xs font-sans uppercase tracking-[0.3em] mb-4"
          >
            {dict.subtitle}
          </p>
          <h2
            ref={titleRef}
            className="text-3xl md:text-5xl lg:text-6xl font-serif font-light text-ivory uppercase tracking-[0.15em]"
          >
            {dict.title}
          </h2>
          <div
            ref={lineRef}
            className="w-20 h-px bg-champagne/40 mx-auto mt-8 origin-center"
          />
        </div>

        {/* ── Masonry Grid ── */}
        {projects.length > 0 ? (
          <div
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-3 auto-rows-[minmax(200px,auto)] gap-4 md:gap-5"
          >
            {projects.map((project, idx) => {
              const size = getCardSize(idx);

              return (
                <div
                  key={project.id}
                  ref={(el) => { cardRefs.current[idx] = el; }}
                  className={`
                    relative group bg-charcoal cursor-pointer overflow-hidden
                    ${sizeClasses[size]}
                    ${aspectClasses[size]}
                  `}
                  style={{
                    willChange: 'transform',
                    transform: 'translateZ(0)',
                  }}
                  onMouseMove={(e) => handleMouseMove(e, idx)}
                  onMouseLeave={() => handleMouseLeave(idx)}
                  onClick={() => {
                    if (project.video_url) {
                      setActiveVideo(project.video_url);
                      setActiveProjectData(project);
                    }
                  }}
                >
                  {/* Image */}
                  <div className="absolute inset-0 overflow-hidden">
                    {project.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={project.cover_image_url}
                        alt={`${project.title} — ${project.couple_name}`}
                        className="card-image w-full h-full object-cover transition-[filter] duration-700 group-hover:brightness-[0.35]"
                      />
                    ) : (
                      <div className="w-full h-full bg-graphite flex items-center justify-center">
                        <span className="font-sans uppercase text-mist/40 tracking-[0.2em] text-xs">
                          {dict.no_cover}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Magnetic glow — follows cursor */}
                  <div
                    className="magnetic-glow pointer-events-none absolute inset-0 opacity-0"
                    style={{
                      background: 'radial-gradient(circle 300px at center, rgba(198,165,110,0.12), transparent 70%)',
                    }}
                  />

                  {/* Bottom gradient */}
                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-obsidian/90 via-obsidian/40 to-transparent pointer-events-none" />

                  {/* Content overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-7">
                    <p className="text-champagne text-[11px] tracking-[0.3em] uppercase font-sans mb-1.5 md:translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
                      {project.couple_name}
                    </p>
                    <h3
                      className={`
                        text-ivory font-serif font-light tracking-[0.08em] uppercase leading-tight
                        md:translate-y-3 group-hover:translate-y-0 transition-transform duration-500 delay-75
                        ${size === 'large' ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'}
                      `}
                    >
                      {project.title}
                    </h3>

                    {/* Location + Date */}
                    {(project.location || project.event_date) && (
                      <div className="flex items-center gap-3 mt-2 md:opacity-0 md:translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-150">
                        {project.location && (
                          <span className="text-mist/40 text-[10px] font-sans uppercase tracking-[0.15em]">
                            {project.location}
                          </span>
                        )}
                        {project.location && project.event_date && (
                          <span className="w-3 h-px bg-champagne/30" />
                        )}
                        {project.event_date && (
                          <span className="text-mist/30 text-[10px] font-sans tracking-[0.15em]">
                            {new Date(project.event_date).toLocaleDateString('es-MX', {
                              year: 'numeric',
                              month: 'short',
                            }).toUpperCase()}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Play button for video projects */}
                    {project.video_url && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 border border-champagne/40 flex items-center justify-center text-champagne opacity-0 group-hover:opacity-100 transition-all duration-500 scale-75 group-hover:scale-100 backdrop-blur-sm bg-obsidian/20 rounded-full">
                        <Play size={20} className="ml-0.5" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center border border-graphite">
            <p className="font-sans text-mist/40 uppercase tracking-[0.2em] text-sm">
              {dict.empty}
            </p>
          </div>
        )}
      </div>

      {/* ── Video Modal — Cinematic Style ── */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-[100] bg-obsidian/95 backdrop-blur-md animate-fade-in overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setActiveVideo(null);
              setActiveProjectData(null);
            }
          }}
        >
          {/* Close Button — fixed top-right, always visible */}
          <button
            onClick={() => {
              setActiveVideo(null);
              setActiveProjectData(null);
            }}
            className="fixed top-4 right-4 sm:top-6 sm:right-6 text-mist/60 hover:text-champagne transition-colors duration-400 z-[110] w-10 h-10 flex items-center justify-center rounded-full bg-obsidian/60 backdrop-blur-sm border border-white/10"
            aria-label="Cerrar video"
          >
            <X size={20} />
          </button>

          <div className="min-h-full flex flex-col items-center justify-center px-4 py-16 sm:px-6 sm:py-12">
            <div className="w-full max-w-6xl">
              <div className="w-full aspect-video bg-black border border-graphite relative">
                <Vimeo
                  video={activeVideo}
                  autoplay={true}
                  responsive={true}
                  className="w-full h-full [&>div]:w-full [&>div]:h-full [&>div>iframe]:w-full [&>div>iframe]:h-full absolute top-0 left-0"
                />
              </div>

              {/* Gallery Plaque — Museum Style */}
              {activeProjectData && (
                <div
                  className="mt-5 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 animate-fade-up"
                  style={{ animationDelay: '300ms' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-champagne text-[10px] font-sans uppercase tracking-[0.3em] mb-1">
                      {activeProjectData.couple_name}
                    </p>
                    <h3 className="text-ivory text-lg sm:text-xl font-serif font-light tracking-[0.08em] uppercase leading-tight">
                      {activeProjectData.title}
                    </h3>
                    {activeProjectData.description && (
                      <p className="text-mist/40 text-xs font-sans mt-2 leading-relaxed max-w-2xl italic">
                        {activeProjectData.description}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0 sm:text-right">
                    {activeProjectData.location && (
                      <p className="text-mist/30 text-[10px] font-sans uppercase tracking-[0.2em]">
                        {activeProjectData.location}
                      </p>
                    )}
                    {activeProjectData.event_date && (
                      <p className="text-mist/20 text-[10px] font-sans tracking-[0.15em] mt-1">
                        {new Date(activeProjectData.event_date)
                          .toLocaleDateString('es-MX', { year: 'numeric', month: 'long' })
                          .toUpperCase()}
                      </p>
                    )}
                  </div>
                </div>
              )}
              <div className="w-full h-px bg-gradient-to-r from-transparent via-champagne/20 to-transparent mt-3" />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
