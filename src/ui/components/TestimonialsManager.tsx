'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import imageCompression from 'browser-image-compression';
import { createClient } from '@/lib/supabase/client';
import { saveTestimonial, deleteTestimonial } from '@/core/actions/testimonialActions';
import { testimonialPhoto, type Testimonial, type TestimonialInput } from '@/core/utils/testimonials';
import type { Dictionary } from '@/lib/dictionaries';

const empty: TestimonialInput = { name: '', rating: 5, comment: '', comment_en: null, photo_path: null };
const inputClass = 'w-full bg-obsidian border border-graphite p-3 text-ivory focus:outline-none focus:border-champagne';
const buttonClass = 'px-5 py-3 border border-champagne/40 text-champagne text-xs uppercase tracking-widest hover:bg-champagne/10 disabled:opacity-40';

export function TestimonialsManager({ initial, dict }: { initial: Testimonial[]; dict: Dictionary['testimonials']['admin'] }) {
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [id, setId] = useState<string>();
  const [values, setValues] = useState<TestimonialInput>(empty);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function edit(item?: Testimonial) {
    setValues(item ?? empty); setId(item?.id); setFile(null); setPreview(null);
    setMessage(''); setError(''); setEditing(true);
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ block: 'start' }));
  }
  function pickPhoto(selected?: File) {
    if (!selected) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'].includes(selected.type) || selected.size > 10 * 1024 * 1024) {
      setError(dict.invalid_photo); return;
    }
    setError(''); setFile(selected); setPreview(URL.createObjectURL(selected));
  }
  const errorText = (code: string) => dict[code as keyof typeof dict] || dict.save_error;

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    const supabase = createClient();
    let uploaded: string | null = null;
    try {
      let photo_path = values.photo_path;
      if (file) {
        const compressed = await imageCompression(file, { maxSizeMB: 0.15, maxWidthOrHeight: 400, useWebWorker: true, fileType: 'image/jpeg' });
        const path = `testimonials/${crypto.randomUUID()}.jpg`;
        const { error: uploadError } = await supabase.storage.from('oniria').upload(path, compressed, { contentType: 'image/jpeg' });
        if (uploadError) throw new Error(dict.upload_error);
        photo_path = uploaded = path;
      }
      const result = await saveTestimonial({ ...values, photo_path }, id);
      if (!result.data) {
        if (uploaded) await supabase.storage.from('oniria').remove([uploaded]);
        throw new Error(errorText(result.error || 'save_error'));
      }
      const saved = result.data;
      uploaded = null;
      setItems(previous => id ? previous.map(item => item.id === id ? saved : item) : [saved, ...previous]);
      setEditing(false); setFile(null); setPreview(null); setMessage(dict.saved);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.save_error);
    } finally { setBusy(false); }
  }
  async function remove(item: Testimonial) {
    if (!window.confirm(dict.confirm_delete.replace('{name}', item.name))) return;
    setBusy(true); setError(''); setMessage('');
    try {
      const result = await deleteTestimonial(item.id);
      if (result.error) throw new Error(errorText(result.error));
      setItems(previous => previous.filter(row => row.id !== item.id));
      if (id === item.id) setEditing(false);
      setMessage(dict.deleted); router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : dict.delete_error); }
    finally { setBusy(false); }
  }
  const photo = preview || testimonialPhoto(values.photo_path);
  return <div className="max-w-6xl mx-auto space-y-8">
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="text-3xl font-serif text-ivory">{dict.title}</h1><p className="text-sm text-mist/50 mt-2">{dict.description}</p></div>
      <button type="button" onClick={() => edit()} disabled={busy} className={buttonClass}>{dict.new}</button>
    </header>
    {error && <p role="alert" className="text-red-300 border border-red-400/30 p-4">{error}</p>}
    {message && <p role="status" className="text-champagne border border-champagne/30 p-4">{message}</p>}
    {editing && <form ref={formRef} onSubmit={submit} className="bg-charcoal border border-graphite p-6 md:p-8 scroll-mt-6">
      <fieldset disabled={busy} className="space-y-6">
        <legend className="font-serif text-xl mb-6">{id ? dict.edit : dict.new}</legend>
        <div className="grid md:grid-cols-2 gap-6">
          <label className="block text-sm space-y-2"><span>{dict.name}</span><input required maxLength={120} value={values.name} onChange={e => setValues({ ...values, name: e.target.value })} className={inputClass} /></label>
          <label className="block text-sm space-y-2"><span>{dict.rating}</span><select value={values.rating} onChange={e => setValues({ ...values, rating: Number(e.target.value) })} className={inputClass}>
            {[1,2,3,4,5].map(stars => <option key={stars} value={stars}>{'★'.repeat(stars)} ({stars}/5)</option>)}
          </select></label>
        </div>
        <label className="block text-sm space-y-2"><span>{dict.comment}</span><textarea required maxLength={3000} rows={5} value={values.comment} onChange={e => setValues({ ...values, comment: e.target.value })} className={inputClass} /></label>
        <label className="block text-sm space-y-2"><span>{dict.comment_en}</span><textarea maxLength={3000} rows={4} value={values.comment_en ?? ''} onChange={e => setValues({ ...values, comment_en: e.target.value })} className={inputClass} /><span className="block text-xs text-mist/50">{dict.translation_hint}</span></label>
        <div className="space-y-3">
          <label className="block text-sm space-y-2"><span>{dict.photo}</span><input key={`${id}-${editing}`} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={e => { pickPhoto(e.target.files?.[0]); e.target.value = ''; }} className={inputClass} /></label>
          <p className="text-xs text-mist/50">{dict.photo_hint}</p>
          {photo && <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt={dict.photo} className="w-16 h-16 rounded-full object-cover" />
            <button type="button" onClick={() => { setValues({ ...values, photo_path: null }); setFile(null); setPreview(null); }} className={buttonClass}>{dict.remove_photo}</button>
          </div>}
        </div>
        <div className="flex flex-wrap gap-4"><button type="submit" className={`${buttonClass} bg-champagne text-obsidian`}>{busy ? dict.saving : dict.save}</button><button type="button" onClick={() => { setEditing(false); setFile(null); setPreview(null); }} className={buttonClass}>{dict.cancel}</button></div>
      </fieldset>
    </form>}
    {!items.length && <p className="p-10 border border-graphite text-mist/50 text-center">{dict.empty}</p>}
    <div className="grid md:grid-cols-2 gap-6">
      {items.map(item => <article key={item.id} className="bg-charcoal border border-graphite p-6 min-w-0">
        <div className="flex items-center gap-4 mb-4">
          {item.photo_path ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={testimonialPhoto(item.photo_path)!} alt="" className="w-12 h-12 rounded-full object-cover" />
          ) : <span aria-hidden="true" className="w-12 h-12 rounded-full bg-graphite flex items-center justify-center text-champagne">{item.name.slice(0,1).toUpperCase()}</span>}
          <div className="min-w-0"><h2 className="font-serif text-xl break-words">{item.name}</h2><p className="text-champagne" aria-label={`${item.rating}/5`}>{'★'.repeat(item.rating)}{'☆'.repeat(5-item.rating)}</p></div>
        </div>
        <p className="text-mist/70 whitespace-pre-line break-words mb-6">{item.comment}</p>
        <div className="flex gap-3"><button type="button" disabled={busy} onClick={() => edit(item)} className={buttonClass} aria-label={`${dict.edit}: ${item.name}`}>{dict.edit}</button><button type="button" disabled={busy} onClick={() => remove(item)} className={`${buttonClass} text-red-300 border-red-300/30`} aria-label={`${dict.delete}: ${item.name}`}>{dict.delete}</button></div>
      </article>)}
    </div>
  </div>;
}
