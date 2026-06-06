'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

interface EditorialInterludeProps {
  /** The main large quote or phrase */
  quote: string;
  /** A smaller subtitle or attribution */
  subtitle?: string;
  /** URL of video or image for the parallax side */
  mediaUrl: string;
  /** Whether the media is a video (mp4) or an image */
  mediaType?: 'image' | 'video';
  /** Which side the text appears on */
  textSide?: 'left' | 'right';
  /** Optional champagne accent word within the quote (will be highlighted) */
  accentWord?: string;
}

export function EditorialInterlude({
  quote,
  subtitle,
  mediaUrl,
  mediaType = 'image',
  textSide = 'left',
  accentWord,
}: EditorialInterludeProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const mediaInnerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLHeadingElement>(null);
  const subtitleRefEl = useRef<HTMLParagraphElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    /* ── Media parallax ── */
    if (mediaInnerRef.current) {
      gsap.fromTo(
        mediaInnerRef.current,
        { y: 60, scale: 1.15 },
        {
          y: -60,
          scale: 1.15,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          },
        }
      );
    }

    /* ── Text drift ── */
    if (textRef.current) {
      gsap.fromTo(
        textRef.current,
        { y: 60 },
        {
          y: -30,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          },
        }
      );
    }

    /* ── Reveal animations ── */
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 75%',
        toggleActions: 'play none none reverse',
      },
    });

    // Decorative line
    if (lineRef.current) {
      tl.from(lineRef.current, {
        scaleX: 0,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
      });
    }

    // Quote
    if (quoteRef.current) {
      tl.from(
        quoteRef.current,
        {
          y: 50,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
        },
        '-=0.4'
      );
    }

    // Subtitle
    if (subtitleRefEl.current) {
      tl.from(
        subtitleRefEl.current,
        {
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
        },
        '-=0.6'
      );
    }

    // Dot
    if (dotRef.current) {
      tl.from(
        dotRef.current,
        {
          scale: 0,
          opacity: 0,
          duration: 0.6,
          ease: 'back.out(2)',
        },
        '-=0.4'
      );
    }
  }, { scope: sectionRef });

  // Split the quote to highlight the accent word
  const renderQuote = () => {
    if (!accentWord) {
      return <span>{quote}</span>;
    }
    const parts = quote.split(new RegExp(`(${accentWord})`, 'i'));
    return parts.map((part, i) =>
      part.toLowerCase() === accentWord.toLowerCase() ? (
        <span key={i} className="text-champagne">{part}</span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  const textContent = (
    <div
      ref={textRef}
      className="flex flex-col justify-center px-8 md:px-16 lg:px-24 py-20 md:py-0"
    >
      {/* Decorative line */}
      <div
        ref={lineRef}
        className="w-10 h-px bg-champagne mb-10"
        style={{ transformOrigin: textSide === 'left' ? 'left' : 'right' }}
      />

      {/* Quote */}
      <h2
        ref={quoteRef}
        className="text-3xl md:text-4xl lg:text-5xl font-serif font-light leading-[1.2] tracking-[0.02em] text-ivory"
      >
        {renderQuote()}
      </h2>

      {/* Subtitle */}
      {subtitle && (
        <p
          ref={subtitleRefEl}
          className="mt-8 text-xs font-sans uppercase tracking-[0.3em] text-mist/40"
        >
          {subtitle}
        </p>
      )}

      {/* Floating accent dot */}
      <div
        ref={dotRef}
        className="mt-12 w-1.5 h-1.5 rounded-full bg-champagne/60"
      />
    </div>
  );

  const mediaContent = (
    <div className="relative overflow-hidden h-[50vh] md:h-full md:min-h-[70vh]">
      <div
        ref={mediaInnerRef}
        className="absolute inset-0"
      >
        {mediaType === 'video' ? (
          <video
            src={mediaUrl}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mediaUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Strong gradient blend toward text side */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          textSide === 'left'
            ? 'bg-gradient-to-r from-obsidian via-obsidian/70 via-30% to-transparent'
            : 'bg-gradient-to-l from-obsidian via-obsidian/70 via-30% to-transparent'
        }`}
      />

      {/* Top/bottom cinematic fade */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-obsidian/60 via-transparent to-obsidian/60" />
    </div>
  );

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-obsidian overflow-hidden"
    >
      <div className={`grid grid-cols-1 md:grid-cols-2 min-h-[70vh] ${
        textSide === 'right' ? 'md:[direction:rtl]' : ''
      }`}>
        <div className={textSide === 'right' ? 'md:[direction:ltr]' : ''}>
          {textContent}
        </div>
        <div className={textSide === 'right' ? 'md:[direction:ltr]' : ''}>
          {mediaContent}
        </div>
      </div>

      {/* Subtle horizontal separator lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-graphite/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-graphite/40 to-transparent" />
    </section>
  );
}
