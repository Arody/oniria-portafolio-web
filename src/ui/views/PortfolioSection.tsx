'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { X, Play, ChevronDown } from 'lucide-react';
import type { PortfolioProject } from '@/core/services/portfolioService';

// Dynamically import Vimeo player to avoid SSR issues
const Vimeo = dynamic(() => import('@u-wave/react-vimeo'), { ssr: false });

interface PortfolioSectionProps {
  projects: PortfolioProject[];
}

export function PortfolioSection({ projects }: PortfolioSectionProps) {
  const [filter, setFilter] = useState('Todas');
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const filterBarRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const categories = ['Todas', 'Bodas', 'Pre-boda', 'Detalles', 'Recepción'];

  // Sliding underline indicator
  const updateIndicator = useCallback(() => {
    const btn = buttonRefs.current.get(filter);
    const bar = filterBarRef.current;
    if (btn && bar) {
      const barRect = bar.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      setIndicatorStyle({
        left: btnRect.left - barRect.left,
        width: btnRect.width,
      });
    }
  }, [filter]);

  useEffect(() => {
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  const filteredProjects = projects.filter((project) => {
    if (filter === 'Todas') return true;
    return project.category === filter;
  });

  // Assign dynamic heights for masonry look
  const getDynamicHeight = (index: number) => {
    const heights = ['h-96', 'h-72', 'h-80', 'h-[28rem]'];
    return heights[index % heights.length];
  };

  return (
    <section id="portafolio" className="py-28 bg-obsidian relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Header */}
        <div className="mb-20 text-center">
          <p className="text-champagne text-xs font-sans uppercase tracking-[0.3em] mb-4">
            Our work
          </p>
          <h2 className="text-5xl md:text-7xl font-serif font-light text-ivory uppercase tracking-[0.1em]">
            Portafolio
          </h2>
          <div className="w-16 h-px bg-champagne/40 mx-auto mt-8" />
        </div>

        {/* Mobile: Collapsible Capsule Filter */}
        <div className="md:hidden flex flex-col items-center mb-16">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex items-center gap-3 px-6 py-3 border border-graphite bg-charcoal text-ivory font-serif text-sm tracking-[0.08em] transition-all duration-400 hover:border-champagne/30"
          >
            <span className="text-champagne">{filter}</span>
            <ChevronDown size={14} className={`text-mist/40 transition-transform duration-400 ${mobileOpen ? 'rotate-180' : ''}`} />
          </button>

          <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${mobileOpen ? 'max-h-80 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}`}>
            <div className="flex flex-col items-center gap-1 border border-graphite bg-charcoal p-3">
              {categories.map((cat, idx) => (
                <button
                  key={cat}
                  onClick={() => { setFilter(cat); setMobileOpen(false); }}
                  className={`w-full px-8 py-3 font-serif text-sm tracking-[0.08em] transition-all duration-400 ${filter === cat
                    ? 'text-champagne bg-champagne/5'
                    : 'text-mist/40 hover:text-ivory'
                    }`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop: Editorial Sliding Underline Bar */}
        <div className="relative hidden md:flex justify-center mb-20" ref={filterBarRef}>
          <div className="flex items-center">
            {categories.map((cat, idx) => (
              <div key={cat} className="flex items-center">
                {idx > 0 && (
                  <span className="w-px h-3 bg-graphite/60 mx-3" />
                )}
                <button
                  ref={(el) => { if (el) buttonRefs.current.set(cat, el); }}
                  onClick={() => setFilter(cat)}
                  className={`relative px-6 py-3 font-serif text-base tracking-[0.08em] transition-all duration-500 ${filter === cat
                    ? 'text-champagne'
                    : 'text-mist/35 hover:text-mist/70'
                    }`}
                >
                  {cat}
                </button>
              </div>
            ))}
          </div>
          {/* Sliding underline */}
          <span
            className="absolute bottom-0 h-px bg-champagne transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
          />
        </div>

        {/* Grid */}
        {filteredProjects.length > 0 ? (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
            {filteredProjects.map((project, idx) => (
              <div
                key={project.id}
                className="relative group overflow-hidden bg-charcoal block break-inside-avoid cursor-pointer animate-scale-reveal"
                style={{ animationDelay: `${idx * 100}ms` }}
                onClick={() => project.video_url && setActiveVideo(project.video_url)}
              >
                <div className={`relative w-full ${getDynamicHeight(idx)}`}>
                  {project.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={project.cover_image_url}
                      alt={`${project.title} - ${project.couple_name}`}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-50"
                    />
                  ) : (
                      <div className="w-full h-full bg-graphite flex items-center justify-center">
                        <span className="font-sans uppercase text-mist/40 tracking-[0.2em] text-xs">Sin Portada</span>
                    </div>
                  )}
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-obsidian/70 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center p-6 text-center">
                  <p className="text-champagne text-xs tracking-[0.3em] uppercase mb-3 font-sans translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    {project.couple_name}
                  </p>
                  <h3 className="text-ivory text-2xl font-serif font-light tracking-[0.1em] uppercase mb-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                    {project.title}
                  </h3>
                  {project.video_url && (
                    <div className="mt-4 w-12 h-12 border border-champagne/50 flex items-center justify-center text-champagne hover:bg-champagne hover:text-obsidian transition-all duration-400 translate-y-4 group-hover:translate-y-0 delay-150">
                      <Play size={18} className="ml-0.5" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
            <div className="py-20 text-center border border-graphite">
              <p className="font-sans text-mist/40 uppercase tracking-[0.2em] text-sm">No hay proyectos para esta categoría.</p>
          </div>
        )}

      </div>

      {/* Video Modal — Cinematic Style */}
      {activeVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-obsidian/95 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-6xl aspect-video bg-black border border-graphite">
            {/* Close Button */}
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute -top-12 right-0 text-mist/60 hover:text-champagne transition-colors duration-400 z-50"
              aria-label="Cerrar video"
            >
              <X size={24} />
            </button>

            <div className="w-full h-full relative">
              <Vimeo
                video={activeVideo}
                autoplay={true}
                responsive={true}
                className="w-full h-full [&>div]:w-full [&>div]:h-full [&>div>iframe]:w-full [&>div>iframe]:h-full absolute top-0 left-0"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
