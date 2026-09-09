'use client';

import { useState, useRef } from 'react';
import { submitContactMessage } from '@/core/actions/emailActions';
import type { Dictionary } from '@/lib/dictionaries';

const inputClass = 'mt-3 w-full min-w-0 rounded-none p-4 bg-charcoal border border-graphite text-ivory font-sans text-sm placeholder:text-mist/40 focus:outline-none focus:border-champagne transition-colors duration-400 disabled:opacity-50 [color-scheme:dark]';

export function ContactSection({ dict }: { dict: Dictionary['contact'] }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const submissionId = useRef<string | null>(null);
  const submitting = useRef(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setStatus('loading');
    setErrorMessage('');

    const form = e.currentTarget;
    submissionId.current ??= crypto.randomUUID();
    const data = { ...Object.fromEntries(new FormData(form)), id: submissionId.current };

    try {
      const result = await submitContactMessage(data);
      if (!result.success) {
        setStatus('error');
        setErrorMessage(result.error === 'invalid' ? dict.invalid : result.error === 'rate' ? dict.rate : dict.error);
        return;
      }
      setStatus('success');
      form.reset();
      submissionId.current = null;
    } catch {
      setStatus('error');
      setErrorMessage(dict.error);
    } finally {
      submitting.current = false;
    }
  };

  return (
    <section aria-labelledby="contact-title" className="py-16 md:py-28 bg-obsidian">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-12 lg:gap-20 items-start">
        <header className="lg:sticky lg:top-32">
          <p className="text-champagne text-xs font-sans uppercase tracking-[0.3em] mb-4">{dict.subtitle}</p>
          <h1 id="contact-title" className="text-3xl md:text-5xl lg:text-6xl font-serif font-light text-ivory uppercase tracking-[0.1em] mb-6">{dict.title}</h1>
          <div className="w-16 h-px bg-champagne/40 mb-8" />
          <p className="text-mist/70 text-sm md:text-base leading-relaxed max-w-md">{dict.description}</p>
          <p className="mt-10 text-champagne/70 text-[10px] tracking-[0.2em] uppercase">{dict.worldwide}</p>
        </header>

        <div className="min-w-0">
          {status === 'success' && (
            <div role="status" className="mb-8 p-6 bg-champagne/10 border border-champagne/30">
              <h2 className="text-lg font-serif text-champagne mb-2">{dict.success_title}</h2>
              <p className="text-mist/70 text-sm">{dict.success_message}</p>
            </div>
          )}
          {status === 'error' && (
            <div role="alert" className="mb-8 p-6 bg-red-900/20 border border-red-500/30">
              <h2 className="text-lg font-serif text-red-400 mb-2">{dict.error_title}</h2>
              <p className="text-red-300 text-sm">{errorMessage}</p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            aria-busy={status === 'loading'}
            onInvalidCapture={event => (event.target as HTMLInputElement | HTMLTextAreaElement).setCustomValidity(dict.invalid)}
            onInputCapture={event => (event.target as HTMLInputElement | HTMLTextAreaElement).setCustomValidity('')}
          >
            <div hidden aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
            <p className="text-xs text-mist/60 mb-8">{dict.required_note}</p>
            <fieldset disabled={status === 'loading'} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {([
                { name: 'name', type: 'text', minLength: 2, maxLength: 120, autoComplete: 'name', wide: true },
                { name: 'date', type: 'date' },
                { name: 'planner', type: 'text', maxLength: 160, placeholder: dict.form.planner_hint },
                { name: 'venue', type: 'text', maxLength: 300, wide: true },
                { name: 'guests', type: 'number', min: 1, max: 100000, step: 1 },
                { name: 'phone', type: 'tel', maxLength: 40, autoComplete: 'tel' },
                { name: 'email', type: 'email', maxLength: 254, autoComplete: 'email', wide: true },
                { name: 'otherContact', type: 'text', maxLength: 200, placeholder: dict.form.other_contact_hint, wide: true },
              ] as const).map(({ name, ...field }) => {
                const { wide, ...input } = { wide: false, ...field };
                return (
                  <label key={name} className={`block text-xs tracking-wide text-mist/70 ${wide ? 'sm:col-span-2' : ''}`}>
                    {dict.form[name]}{name !== 'otherContact' && ' *'}
                    <input {...input} name={name} required={name !== 'otherContact'} className={inputClass} />
                  </label>
                );
              })}
              {(['vision', 'highlights'] as const).map(name => (
                <label key={name} className="block text-xs leading-relaxed tracking-wide text-mist/70 sm:col-span-2">
                  {dict.form[name]} *
                  <textarea name={name} required minLength={10} maxLength={2000} rows={5} className={`${inputClass} resize-y`} aria-describedby={`${name}-hint`} />
                  <span id={`${name}-hint`} className="block mt-2 text-mist/50">{dict.form.answer_hint}</span>
                </label>
              ))}
              <button type="submit" className="sm:col-span-2 mt-2 w-full bg-champagne text-obsidian p-5 font-sans uppercase tracking-[0.25em] text-xs hover:bg-gold-dust focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-champagne transition-colors duration-400 disabled:opacity-40 disabled:cursor-not-allowed">
                {status === 'loading' ? dict.form.sending : dict.form.submit}
              </button>
            </fieldset>
          </form>
        </div>
      </div>
    </section>
  );
}
