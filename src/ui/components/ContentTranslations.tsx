'use client';

import { useState } from 'react';
import type { Translations } from '@/core/utils/localization';
import { RichTextEditor } from './RichTextEditor';
import es from '@/lib/dictionaries/es.json';

const labels: Record<string, string> = {
  site_title: 'Nombre del sitio', site_description: 'Descripción del sitio', hero_title: 'Título de portada', hero_subtitle: 'Subtítulo de portada',
  title: 'Título', excerpt: 'Extracto', content: 'Artículo', category: 'Categoría', description: 'Descripción',
  collage_title: 'Título del collage', collage_signature: 'Firma del collage',
  ...Object.fromEntries(Object.entries(es.about_admin.fields).map(([key, label]) => [`about_${key}`, `Nosotros: ${label}`])),
  ...Object.fromEntries([1, 2, 3].map(n => [`philosophy_phrase_${n}`, `Filosofía: frase ${n}`])),
  ...Object.fromEntries([1, 2, 3, 4, 5, 6].map(n => [`collage_text_${n}`, `Collage: texto ${n}`])),
  ...Object.fromEntries([1, 2].flatMap(n => [['quote', 'Frase'], ['subtitle', 'Firma'], ['accent', 'Palabra destacada']].map(([key, label]) => [`interlude_${n}_${key}`, `Interludio ${n}: ${label}`]))),
};

export function ContentTranslations({ value = {}, onChange, fields, base }: {
  value?: Translations; onChange: (value: Translations) => void; fields: readonly string[]; base: object;
}) {
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const update = (key: string, text?: string) => {
    const next = { ...value[language] };
    if (text === undefined) delete next[key]; else next[key] = text;
    onChange({ ...value, [language]: next });
  };
  return <details className="my-8 border border-graphite bg-charcoal/30 p-6">
    <summary className="cursor-pointer font-serif text-xl text-champagne">Traducciones · Español / English</summary>
    <p className="my-4 text-sm text-mist/60">Estas versiones se muestran en el idioma seleccionado y se guardan con el formulario. «Usar original» recupera el texto principal o el predeterminado del sitio. Una traducción vacía oculta ese texto.</p>
    <label className="block mb-6 text-sm text-mist">Idioma del contenido
      <select className="ml-4 border border-graphite bg-obsidian p-2" value={language} onChange={event => setLanguage(event.target.value as 'es' | 'en')}>
        <option value="es">Español</option><option value="en">English</option>
      </select>
    </label>
    <div className="grid md:grid-cols-2 gap-5">
      {fields.map(key => {
        const original = (base as Record<string, unknown>)[key];
        const translated = value[language]?.[key];
        return <div key={`${language}-${key}`} className={key === 'content' ? 'md:col-span-2' : ''}>
          <div className="flex justify-between items-center mb-2 text-xs text-mist/70">
            <span>{labels[key]}</span>
            {translated !== undefined && <button type="button" onClick={() => update(key)} className="text-champagne">Usar original</button>}
          </div>
          {key === 'content' ? <RichTextEditor content={translated ?? (typeof original === 'string' ? original : '')} onChange={html => update(key, html)} /> :
            <textarea aria-label={`${labels[key]} (${language})`} lang={language} rows={3} maxLength={5000} value={translated ?? ''} placeholder={typeof original === 'string' ? original : 'Texto predeterminado del sitio'} onChange={event => update(key, event.target.value)} className="w-full border border-graphite bg-obsidian p-3 text-sm text-ivory" />}
        </div>;
      })}
    </div>
  </details>;
}
