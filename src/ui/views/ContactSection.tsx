'use client';

import { useState } from 'react';
import { sendContactEmails } from '@/core/actions/emailActions';
import { createClient } from '@/lib/supabase/client';
import type { Dictionary } from '@/lib/dictionaries';

export function ContactSection({ dict }: { dict: Dictionary['contact'] }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      date: formData.get('date') as string,
      message: formData.get('message') as string,
    };

    try {
      // 1. Guardar en Supabase (Messages table)
      const { error: dbError } = await supabase
        .from('messages')
        .insert([{
          full_name: data.name,
          email: data.email,
          phone: data.phone || null,
          event_date: data.date || null,
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
    <section id="contacto" className="py-28 bg-obsidian relative">
      {/* Subtle top divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-champagne/30" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          
          {/* Left Form Side */}
          <div>
            <p className="text-champagne text-xs font-sans uppercase tracking-[0.3em] mb-4">
              {dict.subtitle}
            </p>
            <h2 className="text-5xl md:text-7xl font-serif font-light text-ivory uppercase tracking-[0.1em] mb-4">
              {dict.title}
            </h2>
            <div className="w-16 h-px bg-champagne/40 mb-12" />

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
              <div>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
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
                <div>
                  <label htmlFor="phone" className="block text-xs font-sans uppercase tracking-[0.2em] text-mist/50 mb-3">{dict.form.phone}</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone"
                    className="w-full p-4 bg-charcoal border border-graphite text-ivory font-sans text-sm placeholder:text-mist/20 focus:outline-none focus:border-champagne/50 transition-colors duration-400"
                    placeholder="+52 000 000 0000"
                    disabled={status === 'loading'}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="date" className="block text-xs font-sans uppercase tracking-[0.2em] text-mist/50 mb-3">{dict.form.date}</label>
                <input 
                  type="date" 
                  id="date" 
                  name="date"
                  className="w-full p-4 bg-charcoal border border-graphite text-ivory font-sans text-sm focus:outline-none focus:border-champagne/50 transition-colors duration-400" 
                  disabled={status === 'loading'}
                />
              </div>

              <div>
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
                className="w-full bg-champagne text-obsidian p-4 font-sans uppercase tracking-[0.3em] text-xs hover:bg-gold-dust transition-colors duration-400 disabled:opacity-40 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {status === 'loading' ? '⏳' : dict.form.submit}
              </button>
            </form>
          </div>

          {/* Right Info Side */}
          <div className="lg:pl-8 flex flex-col justify-center">
            <div className="mb-16">
              <h3 className="text-xs font-sans uppercase tracking-[0.3em] text-champagne mb-10">Info</h3>
              
              <div className="space-y-10">
                <div>
                  <p className="text-[10px] font-sans text-mist/40 uppercase tracking-[0.2em] mb-2">Email</p>
                  <a href="mailto:hola@oniria-weddings.com" className="text-xl font-serif font-light text-ivory hover:text-champagne transition-colors duration-400">
                    hola@oniria-weddings.com
                  </a>
                </div>
                <div>
                  <p className="text-[10px] font-sans text-mist/40 uppercase tracking-[0.2em] mb-2">Teléfono</p>
                  <a href="tel:+529991234567" className="text-xl font-serif font-light text-ivory hover:text-champagne transition-colors duration-400">
                    +52 999 123 4567
                  </a>
                </div>
                <div>
                  <p className="text-[10px] font-sans text-mist/40 uppercase tracking-[0.2em] mb-2">Ubicación</p>
                  <p className="text-xl font-serif font-light text-ivory">
                    Mérida, Yucatán, México
                  </p>
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
