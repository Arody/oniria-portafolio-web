'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { saveSocialImage } from '@/core/actions/socialImageActions';
import { OG_MAX_BYTES, type SocialImage, type SocialPage } from '@/core/utils/socialImages';
import type { Dictionary } from '@/lib/dictionaries';

const inputClass = 'w-full bg-obsidian border border-graphite p-3 text-ivory focus:outline-none focus:border-champagne';
const buttonClass = 'px-5 py-3 border border-champagne/40 text-champagne text-xs uppercase tracking-widest hover:bg-champagne/10 disabled:opacity-40';

export function SocialImagesManager({ pages, images, dict }: { pages: SocialPage[]; images: SocialImage[]; dict: Dictionary['social_images'] }) {
  const [path, setPath] = useState('');
  const [language, setLanguage] = useState('both');
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const page = pages.find(page => page.path === path) || pages[0];
  const locales = language === 'both' ? ['es', 'en'] as const : [language as 'es' | 'en'];
  const hasCustom = locales.some(locale => images.some(image => image.page_path === `/${locale}${path}`));
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function clearSelection() {
    setPreview(null); setError(''); setMessage('');
    if (fileRef.current) fileRef.current.value = '';
  }
  async function save(reset: boolean) {
    setBusy(true); setError(''); setMessage('');
    const form = new FormData();
    form.set('path', path); form.set('language', language);
    if (reset) form.set('reset', 'true');
    else if (fileRef.current?.files?.[0]) form.set('image', fileRef.current.files[0]);
    try {
      const result = await saveSocialImage(form);
      if (result.error) { setError(dict[result.error]); return; }
      clearSelection(); setMessage(reset ? dict.restored : dict.saved); router.refresh();
    } catch { setError(dict.save_error); }
    finally { setBusy(false); }
  }
  function submit(event: FormEvent) { event.preventDefault(); void save(false); }

  return <div className="max-w-5xl mx-auto space-y-8">
    <header><h1 className="text-3xl font-serif text-ivory">{dict.title}</h1><p className="text-sm text-mist/60 mt-3 max-w-3xl leading-relaxed">{dict.description}</p></header>
    {error && <p role="alert" className="text-red-300 border border-red-400/30 p-4">{error}</p>}
    {message && <p role="status" className="text-champagne border border-champagne/30 p-4">{message}</p>}
    <form onSubmit={submit} className="bg-charcoal border border-graphite p-5 md:p-8">
      <fieldset disabled={busy} className="space-y-8 min-w-0">
        <div className="grid md:grid-cols-[2fr_1fr] gap-5">
          <label className="block text-sm space-y-2 min-w-0"><span>{dict.page}</span><select className={inputClass} value={path} onChange={event => { setPath(event.target.value); clearSelection(); }}>
            {pages.map(page => <option key={page.path} value={page.path}>{page.label}</option>)}
          </select></label>
          <label className="block text-sm space-y-2"><span>{dict.language}</span><select className={inputClass} value={language} onChange={event => { setLanguage(event.target.value); clearSelection(); }}>
            <option value="both">{dict.both}</option><option value="es">ES — Español</option><option value="en">EN — English</option>
          </select></label>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {locales.map(locale => {
            const custom = images.find(image => image.page_path === `/${locale}${path}`);
            return <figure key={locale} className="min-w-0">
              <figcaption className="text-xs text-mist/60 mb-3 flex justify-between gap-2"><span>{locale.toUpperCase()} · {dict.current}</span><span>{custom ? dict.custom : dict.default}</span></figcaption>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={custom?.image_path || page.defaults[locale]} alt={`${dict.current}: ${page.label} (${locale})`} className="w-full aspect-[1200/630] object-contain bg-black border border-graphite" />
              <a href={`/${locale}${path}`} target="_blank" rel="noopener noreferrer" className="block text-xs text-champagne mt-3 break-all">oniriaweddings.com/{locale}{path}</a>
            </figure>;
          })}
        </div>
        <label className="block text-sm space-y-3"><span>{dict.image}</span><input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" required className={`${inputClass} file:mr-3 file:border-0 file:bg-champagne/10 file:text-champagne file:p-2`} onChange={event => {
          setError(''); setMessage(''); setPreview(null);
          const file = event.target.files?.[0];
          if (!file) return;
          if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > OG_MAX_BYTES) { setError(dict.invalid_image); event.target.value = ''; return; }
          setPreview(URL.createObjectURL(file));
        }} /><span className="block text-xs text-mist/50 leading-relaxed">{dict.image_hint}</span></label>
        {preview && <figure className="max-w-xl"><figcaption className="text-xs text-champagne mb-3">{dict.new_preview}</figcaption>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={dict.new_preview} className="w-full aspect-[1200/630] object-contain bg-black border border-champagne/30" />
        </figure>}
        <div className="flex flex-wrap gap-4"><button type="submit" className={buttonClass} disabled={!preview || busy}>{busy ? dict.saving : dict.save}</button><button type="button" className={buttonClass} disabled={!hasCustom || busy} onClick={() => void save(true)}>{dict.restore}</button></div>
        <p className="text-xs text-mist/40 leading-relaxed">{dict.cache_hint}</p>
      </fieldset>
    </form>
  </div>;
}
