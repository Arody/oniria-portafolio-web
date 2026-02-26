'use client';

import { useState } from 'react';
import { sendContactEmails } from '@/core/actions/emailActions';
import { createClient } from '@/lib/supabase/client';

export function ContactSection() {
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
    <section id="contacto" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Left Form Side */}
          <div>
            <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4 text-black border-b-4 border-black inline-block pb-2">
              CONTACTO
            </h2>
            <p className="text-xl md:text-2xl font-medium text-gray-600 mb-12">
              Cuéntanos sobre tu boda soñada
            </p>

            {status === 'success' && (
              <div className="mb-8 p-6 bg-black text-white brutalist-border-thick brutalist-shadow">
                <h3 className="text-xl font-bold uppercase tracking-widest mb-2">¡Mensaje Enviado!</h3>
                <p>Gracias por contactarnos. Hemos recibido tu solicitud y enviado una confirmación a tu correo. Nos pondremos en contacto pronto.</p>
              </div>
            )}

            {status === 'error' && (
              <div className="mb-8 p-6 bg-red-100 text-red-900 brutalist-border-thick border-red-900 brutalist-shadow">
                <h3 className="text-xl font-bold uppercase tracking-widest mb-2">Error</h3>
                <p>{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-bold uppercase tracking-widest mb-2">Nombre completo</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name"
                  className="w-full p-4 brutalist-border bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-black"
                  required 
                  disabled={status === 'loading'}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-bold uppercase tracking-widest mb-2">Correo electrónico</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email"
                    className="w-full p-4 brutalist-border bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-black"
                    required 
                    disabled={status === 'loading'}
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-bold uppercase tracking-widest mb-2">Teléfono</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone"
                    className="w-full p-4 brutalist-border bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-black"
                    disabled={status === 'loading'}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-bold uppercase tracking-widest mb-2">Fecha de la boda</label>
                <input 
                  type="date" 
                  id="date" 
                  name="date"
                  className="w-full p-4 brutalist-border bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-black" 
                  disabled={status === 'loading'}
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-bold uppercase tracking-widest mb-2">Mensaje</label>
                <textarea 
                  id="message" 
                  name="message"
                  rows={6}
                  className="w-full p-4 brutalist-border bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-black resize-none"
                  required 
                  disabled={status === 'loading'}
                />
              </div>

              <button 
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-black text-white p-5 font-bold uppercase tracking-widest text-lg brutalist-border hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {status === 'loading' ? 'ENVIANDO...' : 'ENVIAR MENSAJE'}
              </button>
            </form>
          </div>

          {/* Right Info Side */}
          <div className="lg:pl-12 flex flex-col justify-center">
            <div className="mb-16">
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 pb-2 border-b-2 border-black inline-block">INFO</h3>
              
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Email</p>
                  <a href="mailto:hola@oniria-weddings.com" className="text-2xl font-bold hover:underline">
                    hola@oniria-weddings.com
                  </a>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Teléfono</p>
                  <a href="tel:+529991234567" className="text-2xl font-bold hover:underline">
                    +52 999 123 4567
                  </a>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Ubicación</p>
                  <p className="text-2xl font-bold">
                    Mérida, Yucatán, México
                  </p>
                </div>
              </div>
            </div>

            {/* Faux Map Graphic */}
            <div className="w-full h-64 bg-zinc-200 brutalist-border relative overflow-hidden flex items-center justify-center group">
               <div className="absolute inset-0 opacity-40" 
                    style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
              <div className="z-10 bg-black text-white px-6 py-3 font-bold uppercase tracking-widest text-sm shadow-xl group-hover:scale-110 transition-transform cursor-pointer">
                 VER MÚLTIPLES UBICACIONES
               </div>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}
