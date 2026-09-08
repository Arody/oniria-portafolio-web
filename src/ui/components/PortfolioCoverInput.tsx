'use client';

import { useRef } from 'react';
import es from '@/lib/dictionaries/es.json';
import en from '@/lib/dictionaries/en.json';

export function PortfolioCoverInput({ preview, onChange, disabled, locale }: {
  preview: string | null;
  onChange: (file: File | null) => void;
  disabled: boolean;
  locale: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const dict = (locale === 'en' ? en : es).portfolio_cover;
  const buttonClass = 'px-4 py-3 border border-graphite text-champagne text-xs uppercase tracking-wider hover:border-champagne focus-visible:outline-2 focus-visible:outline-champagne disabled:opacity-40';

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-sans uppercase tracking-[0.2em] text-champagne">{dict.title}</h3>
      {preview && (
        <div className="aspect-video bg-graphite border border-graphite overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={dict.title} className="w-full h-full object-cover" />
        </div>
      )}
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        aria-label={dict.select}
        hidden
        disabled={disabled}
        onChange={event => {
          const file = event.target.files?.[0];
          if (file) onChange(file);
          event.target.value = '';
        }}
      />
      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={disabled} onClick={() => input.current?.click()} className={buttonClass}>
          {preview ? dict.change : dict.select}
        </button>
        {preview && (
          <button type="button" disabled={disabled} onClick={() => onChange(null)} className={buttonClass}>
            {dict.remove}
          </button>
        )}
      </div>
      <p className="text-xs text-mist/50 font-sans">{dict.hint}</p>
    </div>
  );
}
