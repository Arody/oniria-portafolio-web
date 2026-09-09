'use client';

import { useState, useRef, useEffect, useId } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { X, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import type { PortfolioProject } from '@/core/services/portfolioService';
import type { Dictionary } from '@/lib/dictionaries';
import { prefersReducedMotion } from '@/lib/motion';
import { getFilmScrollTarget } from '@/core/utils/filmScroll';
import { InfiniteFilmGrid } from '@/ui/components/InfiniteFilmGrid';
import { createFilmPreview } from '@/core/utils/filmPreview';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Dynamically import Vimeo player to avoid SSR issues
const Vimeo = dynamic(() => import('@u-wave/react-vimeo'), { ssr: false });

interface PortfolioSectionProps {
  projects: PortfolioProject[];
  dict: Dictionary['portfolio'];
  filmsHref?: string;
  locale?: string;
}

export function PortfolioSection({ projects, dict, filmsHref, locale = "es" }: PortfolioSectionProps) {
  const isCarousel = Boolean(filmsHref);
  const Heading = filmsHref ? 'h2' : 'h1';
  const carouselId = useId();
  const carouselRef = useRef<HTMLDivElement>(null);
  const arrowClass = `absolute top-1/2 -translate-y-1/2 z-10 w-11 h-16 flex items-center justify-center bg-obsidian/85 text-ivory hover:text-champagne transition-colors focus-visible:outline-2 focus-visible:outline-champagne ${projects.length < 3 ? 'md:hidden' : ''}`;

  const scrollFilms = (direction: -1 | 1) => {
    const track = carouselRef.current;
    if (!track) return;
    track.scrollTo({
      left: getFilmScrollTarget(track.scrollLeft, track.clientWidth, track.scrollWidth, direction),
      behavior: prefersReducedMotion() ? 'instant' : 'smooth',
    });
  };
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [activeProjectData, setActiveProjectData] = useState<PortfolioProject | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [filmPreview] = useState(() => createFilmPreview(setPreviewId));

  useEffect(() => {
    window.addEventListener('blur', filmPreview.stop);
    window.addEventListener('scroll', filmPreview.stop, true);
    document.addEventListener('visibilitychange', filmPreview.stop);
    return () => {
      filmPreview.stop();
      window.removeEventListener('blur', filmPreview.stop);
      window.removeEventListener('scroll', filmPreview.stop, true);
      document.removeEventListener('visibilitychange', filmPreview.stop);
    };
  }, [filmPreview]);

  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!activeProjectData) return;
    dialogRef.current?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = overflow; };
  }, [activeProjectData]);

  // Refs
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (prefersReducedMotion()) return;

    gsap.from(headerRef.current, {
      opacity: 0,
      duration: 1.2,
      ease: 'power1.out',
      scrollTrigger: {
        trigger: headerRef.current,
        start: 'top 80%',
        once: true,
      },
    });
  }, { scope: sectionRef });

  const renderFilm = (project: PortfolioProject, index: number, duplicate = false) => {
    const Card = duplicate ? 'div' : 'button';
    return (
      <Card
        type={duplicate ? undefined : "button"}
        key={index}
        aria-hidden={duplicate || undefined}
        aria-label={duplicate ? undefined : `${dict.view_story}: ${project.couple_name} — ${project.title}`}
        className="block relative group w-full min-w-0 aspect-video snap-start bg-charcoal cursor-pointer overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-champagne"
        onPointerEnter={event => {
          if (event.pointerType !== 'touch' && project.video_url && !activeProjectData) filmPreview.start(String(index));
        }}
        onPointerLeave={filmPreview.stop}
        onPointerCancel={filmPreview.stop}
        onClick={() => {
          filmPreview.stop();
          setActiveVideo(project.video_url);
          setActiveProjectData(project);
        }}
      >
        {/* Image */}
        <div className="absolute inset-0 overflow-hidden">
          {project.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.cover_image_url}
              alt={`${project.title} — ${project.couple_name}`}
              className="w-full h-full object-cover transition-[filter] duration-700 group-hover:brightness-[0.35] group-focus-visible:brightness-[0.35]"
            />
          ) : (
            <div className="w-full h-full bg-graphite flex items-center justify-center">
              <span className="font-sans uppercase text-mist/40 tracking-[0.2em] text-xs">
                {dict.no_cover}
              </span>
            </div>
          )}
        </div>

        {previewId === String(index) && project.video_url && (
          <div inert aria-hidden="true" className="absolute inset-0 pointer-events-none animate-fade-in">
            <Vimeo
              video={project.video_url}
              autoplay
              muted
              loop
              background
              controls={false}
              responsive
              onError={filmPreview.stop}
              className="absolute inset-0 w-full h-full [&>div]:w-full [&>div]:h-full [&>div]:p-0! [&_iframe]:w-full [&_iframe]:h-full"
            />
          </div>
        )}

        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-obsidian/90 via-obsidian/40 to-transparent pointer-events-none" />

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-5">
          <h3 className="text-ivory font-serif font-light tracking-[0.08em] uppercase leading-tight text-2xl lg:text-3xl mb-2 break-words">
            {project.couple_name}
          </h3>
          <p className="text-champagne text-[11px] tracking-[0.3em] uppercase font-sans">
            {project.title}
          </p>

          {/* Location + Date */}
          {(project.location || project.event_date) && (
            <div className="flex flex-wrap items-center gap-3 mt-2">
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
                  {new Date(project.event_date).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US', {
                    year: 'numeric',
                    month: 'short',
                  }).toUpperCase()}
                </span>
              )}
            </div>
          )}

          {/* Play button for video projects */}
          {project.video_url && previewId !== String(index) && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 border border-champagne/40 flex items-center justify-center text-champagne opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-500 backdrop-blur-sm bg-obsidian/20 rounded-full">
              <Play size={20} className="ml-0.5" />
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <section
      ref={sectionRef}
      id="portafolio"
      className={`${isCarousel ? 'py-28' : 'pt-4'} bg-obsidian relative overflow-hidden`}
    >
      <div className={isCarousel ? 'max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12' : 'w-full px-4 md:px-6'}>

        {/* ── Animated Header ── */}
        <div ref={headerRef} className={`${isCarousel ? 'mb-24' : 'mb-6 px-4'} text-center`}>
          <p
            className="text-champagne text-xs font-sans uppercase tracking-[0.3em] mb-4"
          >
            {dict.subtitle}
          </p>
          <Heading
            aria-label={dict.title}
            className="text-3xl md:text-5xl lg:text-6xl font-serif font-light text-ivory uppercase tracking-[0.15em]"
          >
            {dict.title}
          </Heading>
          <div
            className="w-20 h-px bg-champagne/40 mx-auto mt-8 origin-center"
          />
        </div>

        {/* Homepage carousel; vertically looping gallery on the Films page. */}
        {projects.length > 0 ? (!isCarousel ? (
          <InfiniteFilmGrid count={projects.length} label={dict.carousel} hint={dict.loop_hint}>
            {(index, duplicate) => renderFilm(projects[index % projects.length], index, duplicate)}
          </InfiniteFilmGrid>
        ) : (
          <div className="relative">
            {isCarousel && projects.length > 1 && (
              <button type="button" aria-label={dict.previous} aria-controls={carouselId} onClick={() => scrollFilms(-1)} className={`${arrowClass} -left-4 md:-left-6`}>
                <ChevronLeft size={24} aria-hidden="true" />
              </button>
            )}
            <div
              id={carouselId}
              ref={carouselRef}
              role="region"
              aria-label={dict.carousel}
              tabIndex={isCarousel ? 0 : undefined}
              onKeyDown={event => {
                if (!isCarousel || event.target !== event.currentTarget) return;
                if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                  event.preventDefault();
                  scrollFilms(event.key === 'ArrowLeft' ? -1 : 1);
                }
              }}
              className={isCarousel ? 'grid grid-flow-col auto-cols-[92%] md:auto-cols-[50%] gap-0 overflow-x-auto overscroll-x-contain snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:outline-2 focus-visible:outline-champagne' : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-0'}
            >
              {projects.map((project, index) => renderFilm(project, index))}
            </div>
            {isCarousel && projects.length > 1 && (
              <button type="button" aria-label={dict.next} aria-controls={carouselId} onClick={() => scrollFilms(1)} className={`${arrowClass} -right-4 md:-right-6`}>
                <ChevronRight size={24} aria-hidden="true" />
              </button>
            )}
          </div>
        )) : (
          <div className="py-20 text-center border border-graphite">
            <p className="font-sans text-mist/40 uppercase tracking-[0.2em] text-sm">
              {dict.empty}
            </p>
          </div>
        )}
        {filmsHref && (
          <div className="mt-16 text-center">
            <Link href={filmsHref} className="inline-block px-8 py-4 border border-champagne/40 text-champagne hover:bg-champagne hover:text-obsidian transition-colors font-sans text-xs uppercase tracking-[0.2em]">
              {dict.view_all}
            </Link>
          </div>
        )}
      </div>

      {/* ── Video Modal — Cinematic Style ── */}
      {activeProjectData && (
        <dialog
          ref={dialogRef}
          aria-label={activeProjectData.title}
          onClose={() => { setActiveVideo(null); setActiveProjectData(null); }}
          className="m-0 w-screen h-screen max-w-none max-h-none border-0 p-0 fixed inset-0 z-[100] bg-obsidian/95 backdrop-blur-md animate-fade-in overflow-y-auto"
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
            aria-label={dict.close}
          >
            <X size={20} />
          </button>

          <div className="min-h-full flex flex-col items-center justify-center px-4 py-16 sm:px-6 sm:py-12">
            <div className="w-full max-w-6xl animate-scale-reveal">
              {activeVideo ? <div className="w-full aspect-video bg-black border border-graphite relative">
                <Vimeo
                  video={activeVideo}
                  autoplay={true}
                  responsive={true}
                  className="w-full h-full [&>div]:w-full [&>div]:h-full [&>div>iframe]:w-full [&>div>iframe]:h-full absolute top-0 left-0"
                />
              </div> : <div className="space-y-4">
                {[activeProjectData.cover_image_url, ...(activeProjectData.images || [])].filter((url): url is string => Boolean(url)).map((url, index) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={`${url}-${index}`} src={url} alt={activeProjectData.title} className="w-full max-h-[80vh] object-contain" />
                ))}
              </div>}

              {/* Gallery Plaque — Museum Style */}
              {activeProjectData && (
                <div
                  className="mt-5 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 animate-fade-in"
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
                          .toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US', { year: 'numeric', month: 'long' })
                          .toUpperCase()}
                      </p>
                    )}
                  </div>
                </div>
              )}
              <div className="w-full h-px bg-gradient-to-r from-transparent via-champagne/20 to-transparent mt-3" />
            </div>
          </div>
        </dialog>
      )}
    </section>
  );
}
