'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { prefersReducedMotion } from '@/lib/motion';

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
  const mediaWrapRef = useRef<HTMLDivElement>(null);
  const mediaInnerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const subtitleRefEl = useRef<HTMLParagraphElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (prefersReducedMotion()) return;

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

    // Media — cinematic curtain reveal sweeping away from the text side
    if (mediaWrapRef.current) {
      tl.fromTo(
        mediaWrapRef.current,
        {
          clipPath:
            textSide === 'left'
              ? 'inset(0% 100% 0% 0%)' // media on the right → reveal left to right
              : 'inset(0% 0% 0% 100%)', // media on the left → reveal right to left
        },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.4,
          ease: 'power3.inOut',
        },
        0
      );
    }

    // Decorative line
    if (lineRef.current) {
      tl.from(
        lineRef.current,
        {
          scaleX: 0,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
        },
        0.2
      );
    }

    // Quote — words rise out of their masks one by one
    tl.fromTo(
      '.quote-word',
      { yPercent: 110 },
      {
        yPercent: 0,
        duration: 0.9,
        stagger: 0.045,
        ease: 'power4.out',
      },
      0.35
    );

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

  // Split the quote into masked words, keeping the accent highlight intact.
  // Punctuation stays attached to its word; only the word core is compared
  // against the accent word(s).
  const accentParts = accentWord
    ? accentWord.toLowerCase().split(/\s+/).filter(Boolean)
    : [];

  const renderQuote = () => {
    const words: React.ReactNode[] = [];
    quote.split(/\s+/).filter(Boolean).forEach((token, i) => {
      const lead = token.match(/^[^\p{L}\p{N}]*/u)?.[0] ?? '';
      // All-punctuation token: render it whole as the lead, no core/trail
      const trail = lead === token ? '' : token.match(/[^\p{L}\p{N}]*$/u)?.[0] ?? '';
      const core = token.slice(lead.length, token.length - trail.length);
      const isAccent = core !== '' && accentParts.includes(core.toLowerCase());

      words.push(
        <span
          key={i}
          className="inline-block overflow-hidden align-bottom pb-[0.12em] -mb-[0.12em]"
        >
          <span className="quote-word inline-block will-change-transform">
            {lead}
            <span className={isAccent ? 'text-champagne' : undefined}>{core}</span>
            {trail}
          </span>
        </span>
      );
      words.push(' ');
    });
    return words;
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
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-light leading-[1.2] tracking-[0.02em] text-ivory">
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
    <div
      ref={mediaWrapRef}
      className="relative overflow-hidden h-[50vh] md:h-full md:min-h-[70vh]"
    >
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
