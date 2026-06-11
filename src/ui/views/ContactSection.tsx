'use client';

import { useState, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { sendContactEmails } from '@/core/actions/emailActions';
import { createClient } from '@/lib/supabase/client';
import { prefersReducedMotion } from '@/lib/motion';
import type { Dictionary } from '@/lib/dictionaries';

gsap.registerPlugin(ScrollTrigger);

export function ContactSection({ dict }: { dict: Dictionary['contact'] }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const sectionRef = useRef<HTMLElement>(null);
  const supabase = createClient();

  useGSAP(() => {
    if (prefersReducedMotion()) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 75%',
        toggleActions: 'play none none reverse',
      },
    });

    tl.fromTo('.contact-header > *', { y: 32, opacity: 0 }, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.12,
      ease: 'power3.out',
    })
      .fromTo('.contact-field', { y: 28, opacity: 0 }, {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power3.out',
      }, '-=0.4')
      .fromTo('.contact-info', { x: 48, opacity: 0 }, {
        x: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
      }, '-=0.7');
  }, { scope: sectionRef });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      message: formData.get('message') as string,
      phone: '',
      date: '',
    };

    try {
      // 1. Guardar en Supabase (Messages table)
      const { error: dbError } = await supabase
        .from('messages')
        .insert([{
          full_name: data.name,
          email: data.email,
          phone: null,
          event_date: null,
          message: data.message,
        }]);

      if (dbError) {
        console.error('Error saving message to DB:', dbError);
        throw new Error('Error al guardar el mensaje. Inténtalo de nuevo.');
      }

      // 2. Enviar correos con Resend (Server Action)
      const emailResult = await sendContactEmails(data);

      if (!emailResult.success) {
        throw new Error(emailResult.error || 'Error al enviar el correo.');
      }

      setStatus('success');
      (e.target as HTMLFormElement).reset();

      // Clear success message after 5 seconds
      setTimeout(() => setStatus('idle'), 5000);

    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || 'Ocurrió un error inesperado.');
    }
  };

  return (
    <section ref={sectionRef} id="contacto" className="py-28 bg-obsidian relative">
      {/* Subtle top divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-champagne/30" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">

          {/* Left Form Side */}
          <div>
            <div className="contact-header">
              <p className="text-champagne text-xs font-sans uppercase tracking-[0.3em] mb-4">
                {dict.subtitle}
              </p>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-light text-ivory uppercase tracking-[0.1em] mb-4">
                {dict.title}
              </h2>
              <div className="w-16 h-px bg-champagne/40 mb-12 origin-left" />
            </div>

            {status === 'success' && (
              <div className="mb-8 p-6 bg-champagne/10 border border-champagne/30 animate-fade-in">
                <h3 className="text-lg font-serif text-champagne mb-2">¡Mensaje Enviado!</h3>
                <p className="text-mist/70 text-sm font-sans">Gracias por contactarnos. Hemos recibido tu solicitud y enviado una confirmación a tu correo.</p>
              </div>
            )}

            {status === 'error' && (
              <div className="mb-8 p-6 bg-red-900/20 border border-red-500/30 animate-fade-in">
                <h3 className="text-lg font-serif text-red-400 mb-2">Error</h3>
                <p className="text-red-300/70 text-sm font-sans">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="contact-field">
                <label htmlFor="name" className="block text-xs font-sans uppercase tracking-[0.2em] text-mist/50 mb-3">{dict.form.name}</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name"
                  className="w-full p-4 bg-charcoal border border-graphite text-ivory font-sans text-sm placeholder:text-mist/20 focus:outline-none focus:border-champagne/50 transition-colors duration-400"
                  placeholder=""
                  required 
                  disabled={status === 'loading'}
                />
              </div>
              
              <div className="contact-field">
                <label htmlFor="email" className="block text-xs font-sans uppercase tracking-[0.2em] text-mist/50 mb-3">{dict.form.email}</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  className="w-full p-4 bg-charcoal border border-graphite text-ivory font-sans text-sm placeholder:text-mist/20 focus:outline-none focus:border-champagne/50 transition-colors duration-400"
                  placeholder="ejemplo@email.com"
                  required 
                  disabled={status === 'loading'}
                />
              </div>

              <div className="contact-field">
                <label htmlFor="message" className="block text-xs font-sans uppercase tracking-[0.2em] text-mist/50 mb-3">{dict.form.message}</label>
                <textarea 
                  id="message" 
                  name="message"
                  rows={5}
                  className="w-full p-4 bg-charcoal border border-graphite text-ivory font-sans text-sm placeholder:text-mist/20 focus:outline-none focus:border-champagne/50 transition-colors duration-400 resize-none"
                  placeholder="..."
                  required 
                  disabled={status === 'loading'}
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="contact-field group relative overflow-hidden w-full bg-champagne text-obsidian p-4 font-sans uppercase tracking-[0.3em] text-xs hover:bg-gold-dust transition-colors duration-400 disabled:opacity-40 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {/* Light sweep on hover */}
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-ivory/25 to-transparent transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none" />
                {status === 'loading' ? (
                  <span className="inline-block w-4 h-4 border border-obsidian/30 border-t-obsidian rounded-full animate-spin" aria-label="Enviando…" />
                ) : (
                  dict.form.submit
                )}
              </button>
            </form>
          </div>

          {/* Right Info Side */}
          <div className="contact-info lg:pl-8 flex flex-col justify-center">
            <div className="mb-16">
              <h3 className="text-xs font-sans uppercase tracking-[0.3em] text-champagne mb-10">Info</h3>
              
              <div className="space-y-10">
                <div>
                  <p className="text-[10px] font-sans text-mist/40 uppercase tracking-[0.2em] mb-2">Email</p>
                  <a href="mailto:hola@oniria-weddings.com" className="text-xl font-serif font-light text-ivory hover:text-champagne transition-colors duration-400">
                    hola@oniria-weddings.com
                  </a>
                </div>
              </div>
            </div>

            {/* Decorative Element */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-champagne/30 to-transparent mb-10" />

            <p className="text-mist/30 text-xs font-sans tracking-[0.15em] uppercase text-center">
              Available worldwide
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
