'use client';

import { useEffect, useRef, useState } from 'react';

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
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Intersection Observer for visibility trigger
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(section);

    // Scroll handler for parallax + text displacement
    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const windowH = window.innerHeight;
      // progress: 0 when section enters bottom, 1 when it exits top
      const raw = (windowH - rect.top) / (windowH + rect.height);
      setScrollProgress(Math.max(0, Math.min(1, raw)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial calc

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Parallax: media moves slower than scroll (negative translateY)
  const parallaxY = (scrollProgress - 0.5) * -100; // ±50px range — more pronounced
  // Text displacement: upward drift as you scroll
  const textY = (1 - scrollProgress) * 80; // starts 80px down, ends at 0 — more pronounced

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
      style={{ transform: `translateY(${textY}px)`, transition: 'transform 0.1s linear' }}
    >
      {/* Decorative line */}
      <div
        className={`w-10 h-px bg-champagne mb-10 transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
        }`}
        style={{ transformOrigin: textSide === 'left' ? 'left' : 'right' }}
      />

      {/* Quote */}
      <h2
        className={`text-3xl md:text-4xl lg:text-5xl font-serif font-light leading-[1.2] tracking-[0.02em] text-ivory transition-all duration-[1400ms] ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
        }`}
      >
        {renderQuote()}
      </h2>

      {/* Subtitle */}
      {subtitle && (
        <p
          className={`mt-8 text-xs font-sans uppercase tracking-[0.3em] text-mist/40 transition-all duration-[1600ms] ease-out delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          {subtitle}
        </p>
      )}

      {/* Floating accent dot */}
      <div
        className={`mt-12 w-1.5 h-1.5 rounded-full bg-champagne/60 transition-all duration-[1600ms] ease-out delay-500 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
        }`}
      />
    </div>
  );

  const mediaContent = (
    <div
      ref={mediaRef}
      className="relative overflow-hidden h-[50vh] md:h-full md:min-h-[70vh]"
    >
      <div
        className="absolute inset-0"
        style={{
          transform: `translateY(${parallaxY}px) scale(1.15)`,
          transition: 'transform 0.1s linear',
        }}
      >
        {mediaType === 'video' ? (
          <video
            src={mediaUrl}
            autoPlay
            muted
            loop
            playsInline
            className={`w-full h-full object-cover transition-all duration-[1500ms] ease-out ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mediaUrl}
            alt=""
            className={`w-full h-full object-cover transition-all duration-[1500ms] ease-out ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          />
        )}
      </div>

      {/* Strong gradient blend toward text side — dissolves image into obsidian */}
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

      {/* Very subtle horizontal separator lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-graphite/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-graphite/40 to-transparent" />
    </section>
  );
}
