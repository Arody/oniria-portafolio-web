'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { X, Play } from 'lucide-react';
import type { PortfolioProject } from '@/core/services/portfolioService';
import type { Dictionary } from '@/lib/dictionaries';

// Dynamically import Vimeo player to avoid SSR issues
const Vimeo = dynamic(() => import('@u-wave/react-vimeo'), { ssr: false });

interface PortfolioSectionProps {
  projects: PortfolioProject[];
  dict: Dictionary['portfolio'];
}

export function PortfolioSection({ projects, dict }: PortfolioSectionProps) {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [activeProjectData, setActiveProjectData] = useState<PortfolioProject | null>(null);



  // — Animated header with scroll parallax —
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [headerParallax, setHeaderParallax] = useState({ opacity: 1, y: 0 });

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setHeaderVisible(true); },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const el = headerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const sectionTop = rect.top;
      // Once the header scrolls above the viewport center, start fading & displacing
      const progress = Math.max(0, Math.min(1, -sectionTop / (rect.height * 1.5)));
      setHeaderParallax({
        opacity: 1 - progress * 1.2,
        y: progress * -60,
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="portafolio" className="py-28 bg-obsidian relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Animated Header */}
        <div
          ref={headerRef}
          className="mb-20 text-center"
          style={{
            opacity: headerParallax.opacity,
            transform: `translateY(${headerParallax.y}px)`,
            willChange: 'transform, opacity',
          }}
        >
          <p
            className={`text-champagne text-xs font-sans uppercase tracking-[0.3em] mb-4 transition-all duration-1000 ease-out ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
          >
            {dict.subtitle}
          </p>
          <h2
            className={`text-4xl md:text-6xl font-serif font-light text-ivory uppercase tracking-[0.12em] transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${headerVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'
              }`}
            style={{ transitionDelay: '200ms' }}
          >
            {dict.title}
          </h2>
          <div
            className={`w-16 h-px bg-champagne/40 mx-auto mt-8 transition-all duration-1000 ease-out ${headerVisible ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
              }`}
            style={{ transitionDelay: '600ms' }}
          />
        </div>



        {/* Horizontal Filmstrip Gallery */}
        {projects.length > 0 ? (
          <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar space-x-4 md:space-x-8 pb-12 pt-4 -mx-6 px-6 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
            {projects.map((project, idx) => (
              <div
                key={project.id}
                className="relative group overflow-hidden bg-charcoal flex-shrink-0 snap-center cursor-pointer animate-scale-reveal w-[85vw] md:w-[60vw] lg:w-[45vw] h-[70vh] md:h-[75vh]"
                style={{ animationDelay: `${idx * 100}ms` }}
                onClick={() => { if (project.video_url) { setActiveVideo(project.video_url); setActiveProjectData(project); } }}
              >
                <div className="relative w-full h-full">
                  {project.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={project.cover_image_url}
                      alt={`${project.title} - ${project.couple_name}`}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-50"
                    />
                  ) : (
                      <div className="w-full h-full bg-graphite flex items-center justify-center">
                        <span className="font-sans uppercase text-mist/40 tracking-[0.2em] text-xs">{dict.no_cover}</span>
                    </div>
                  )}
                </div>

                {/* Hover Overlay Desktop / Always-on Overlay Mobile */}
                <div className="absolute inset-0 bg-obsidian/40 md:bg-obsidian/70 md:opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center p-6 text-center">
                  <p className="text-champagne text-xs tracking-[0.3em] uppercase mb-3 font-sans md:translate-y-4 group-hover:translate-y-0 transition-transform duration-500 shadow-black drop-shadow-md">
                    {project.couple_name}
                  </p>
                  <h3 className="text-ivory text-3xl md:text-2xl font-serif font-light tracking-[0.1em] uppercase mb-4 md:translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75 shadow-black drop-shadow-md">
                    {project.title}
                  </h3>
                  {project.video_url && (
                    <div className="mt-4 w-12 h-12 border border-champagne/50 flex items-center justify-center text-champagne hover:bg-champagne hover:text-obsidian transition-all duration-400 md:translate-y-4 group-hover:translate-y-0 delay-150 backdrop-blur-sm bg-obsidian/20 md:bg-transparent">
                      <Play size={18} className="ml-0.5" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
            <div className="py-20 text-center border border-graphite">
              <p className="font-sans text-mist/40 uppercase tracking-[0.2em] text-sm">{dict.empty}</p>
          </div>
        )}

      </div>

      {/* Video Modal — Cinematic Style */}
      {activeVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-obsidian/95 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-6xl">
            {/* Close Button */}
            <button
              onClick={() => { setActiveVideo(null); setActiveProjectData(null); }}
              className="absolute -top-10 right-0 text-mist/60 hover:text-champagne transition-colors duration-400 z-50"
              aria-label="Cerrar video"
            >
              <X size={24} />
            </button>

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
              <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 animate-fade-up" style={{ animationDelay: '300ms' }}>
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
                      {new Date(activeProjectData.event_date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long' }).toUpperCase()}
                    </p>
                  )}
                </div>
              </div>
            )}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-champagne/20 to-transparent mt-3" />
          </div>
        </div>
      )}
    </section>
  );
}
