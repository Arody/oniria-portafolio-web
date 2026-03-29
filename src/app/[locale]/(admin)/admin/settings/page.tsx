'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import imageCompression from 'browser-image-compression';
import { Loader2, UploadCloud, X } from 'lucide-react';
import type { GlobalSettings } from '@/core/services/settingsService';

export default function AdminSettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [settings, setSettings] = useState<GlobalSettings | null>(null);

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [heroBgPreview, setHeroBgPreview] = useState<string | null>(null);
  const [heroBgFile, setHeroBgFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data, error } = await supabase
          .schema('oniria')
          .from('settings')
          .select('*')
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
             throw error;
        }

        if (data) {
          setSettings(data as GlobalSettings);
          setLogoPreview(data.logo_image_url);
          if (data.hero_background_type === 'image') {
              setHeroBgPreview(data.hero_background_url);
          }
        } else {
             setSettings({
                 id: 'default',
                 site_title: 'Oniria Weddings',
                 site_description: '',
                 logo_text: 'ONIRIA.',
                 logo_image_url: null,
               logo_size: 40,
                 heading_font: 'Cabinet Grotesk',
                 body_font: 'Inter',
                 hero_title: 'CREANDO RECUERDOS ATEMPORALES',
                 hero_subtitle: 'Fotografía Editorial',
                 hero_background_type: 'image',
                 hero_background_url: null,
                 contact_email: '',
                 philosophy_phrase_1: 'No fotografiamos bodas. Inmortalizamos la forma en que se miran cuando creen que nadie los ve.',
                 philosophy_phrase_2: 'Cada encuadre es una decisión emocional. Buscamos la verdad en lo efímero, la belleza en lo invisible.',
                 philosophy_phrase_3: 'Creamos relatos visuales que se sienten como recuerdos propios — íntimos, eternos, irrepetibles.',
                 philosophy_enabled: true,
                 updated_at: ''
             });
        }
      } catch (err: any) {
        setError('Error al cargar configuración: ' + err.message);
      } finally {
        setIsFetching(false);
      }
    }

    loadSettings();
  }, [supabase]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!settings) return;
    const { name, value } = e.target;
    setSettings({ ...settings, [name]: value });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      if (settings) setSettings({ ...settings, logo_image_url: '' });
    }
  };

  const handleHeroBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setHeroBgFile(file);
      setHeroBgPreview(URL.createObjectURL(file));
      if (settings) setSettings({ ...settings, hero_background_url: '' });
    }
  };

  const compressImage = async (file: File, isLogo: boolean = false) => {
    const options = {
      maxSizeMB: isLogo ? 0.05 : 0.5,
      maxWidthOrHeight: isLogo ? 500 : 1920,
      useWebWorker: true,
      initialQuality: 0.8,
    };
    return await imageCompression(file, options);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      let final_logo_url = settings.logo_image_url;
      let final_hero_bg_url = settings.hero_background_url;

      if (logoFile) {
        const compressedLogo = await compressImage(logoFile, true);
        const fileName = `logo-${Date.now()}.${compressedLogo.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage.from('oniria').upload(`settings/${fileName}`, compressedLogo);
        if (uploadError) throw uploadError;
        final_logo_url = supabase.storage.from('oniria').getPublicUrl(`settings/${fileName}`).data.publicUrl;
      }

      if (heroBgFile && settings.hero_background_type === 'image') {
        const compressedBg = await compressImage(heroBgFile, false);
        const fileName = `hero-bg-${Date.now()}.${compressedBg.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage.from('oniria').upload(`settings/${fileName}`, compressedBg);
        if (uploadError) throw uploadError;
        final_hero_bg_url = supabase.storage.from('oniria').getPublicUrl(`settings/${fileName}`).data.publicUrl;
      }

      const updatePayload = {
          site_title: settings.site_title,
          site_description: settings.site_description,
          logo_text: settings.logo_text,
          logo_image_url: final_logo_url,
        logo_size: Number(settings.logo_size),
          heading_font: settings.heading_font,
          body_font: settings.body_font,
          hero_title: settings.hero_title,
          hero_subtitle: settings.hero_subtitle,
          hero_background_type: settings.hero_background_type,
          hero_background_url: final_hero_bg_url,
          contact_email: settings.contact_email,
          philosophy_phrase_1: settings.philosophy_phrase_1,
          philosophy_phrase_2: settings.philosophy_phrase_2,
          philosophy_phrase_3: settings.philosophy_phrase_3,
          philosophy_enabled: settings.philosophy_enabled ?? true,
          updated_at: new Date().toISOString()
      };

      const { error: dbError } = await supabase
        .schema('oniria')
        .from('settings')
        .update(updatePayload)
        .eq('is_singleton', true);

      if (dbError) throw dbError;

      setSuccessMsg("Configuración global actualizada correctamente.");
      router.refresh();

    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al guardar la configuración');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full p-4 bg-obsidian border border-graphite text-ivory font-sans text-sm placeholder:text-mist/20 focus:outline-none focus:border-champagne/50 transition-colors duration-400";
  const labelClass = "block text-[10px] font-sans uppercase tracking-[0.2em] text-mist/50 mb-3";

  if (isFetching) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-champagne" />
        <span className="ml-4 font-sans uppercase tracking-[0.15em] text-[10px] text-mist/40">Cargando Ajustes...</span>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32">
      <div>
        <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-mist/40 mb-2">Dashboard / Configuración</p>
        <h1 className="text-3xl font-serif font-light text-ivory uppercase tracking-[0.1em]">Ajustes Globales</h1>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 p-4 text-red-400 text-sm font-sans">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="bg-green-900/20 border border-green-500/30 p-4 text-green-400 text-sm font-sans">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* IDENTIDAD DEL SITIO */}
        <section className="bg-charcoal border border-graphite p-8">
          <h2 className="text-sm font-serif text-champagne uppercase tracking-[0.15em] border-b border-graphite pb-4 mb-6">Identidad Comercial (SEO & Logo)</h2>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                <label className={labelClass}>Título de la Web</label>
                <input type="text" name="site_title" value={settings.site_title || ''} onChange={handleInputChange} className={inputClass} />
                    </div>
                    <div>
                <label className={labelClass}>Descripción (Para Google)</label>
                <input type="text" name="site_description" value={settings.site_description || ''} onChange={handleInputChange} className={inputClass} />
                    </div>
                </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start border-t border-graphite/50 pt-6">
                    <div>
                <label className={labelClass}>Logo de Texto (Fallback)</label>
                <input type="text" name="logo_text" value={settings.logo_text || ''} onChange={handleInputChange} placeholder="ONIRIA." className={`${inputClass} font-serif text-xl`} />
                <p className="text-[10px] text-mist/25 mt-2 font-sans">Se usará si no subes una imagen de logo.</p>
                    </div>
                    
                    <div>
                <label className={labelClass}>Imagen de Logo (Menú / Navbar)</label>
                        {!logoPreview ? (
                  <div className="relative border border-dashed border-graphite bg-obsidian p-6 text-center cursor-pointer hover:border-champagne/30 transition-colors duration-400">
                            <input type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <UploadCloud size={20} className="mx-auto mb-2 text-mist/30" />
                    <p className="font-sans uppercase tracking-[0.15em] text-[10px] text-mist/40">Subir Logo (PNG/SVG)</p>
                            </div>
                        ) : (
                    <div className="relative h-20 bg-charcoal border border-graphite flex items-center justify-center p-2 group overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logoPreview} alt="Logo" className="max-h-full max-w-full object-contain" />
                      <button type="button" onClick={() => { setLogoFile(null); setLogoPreview(null); setSettings({ ...settings, logo_image_url: null }); }} className="absolute top-1 right-1 bg-obsidian/80 border border-graphite w-6 h-6 flex items-center justify-center hover:text-champagne transition-colors">
                        <X size={12} />
                            </button>
                            </div>
                        )}
                    </div>
                </div>

            <div className="border-t border-graphite/50 pt-6 mt-6">
              <div>
                <label className={labelClass}>Tamaño del Logo (Altura para imagen / Fuente para texto)</label>
                <div className="flex items-center gap-4 max-w-md">
                  <input type="range" name="logo_size" min="20" max="150" value={settings.logo_size || 40} onChange={handleInputChange} className="flex-grow accent-champagne cursor-pointer" />
                  <span className="text-ivory font-sans text-sm w-16 text-right">{settings.logo_size || 40}px</span>
                </div>
              </div>
            </div>
            </div>
        </section>

        {/* TIPOGRAFIA */}
        <section className="bg-charcoal border border-graphite p-8">
          <h2 className="text-sm font-serif text-champagne uppercase tracking-[0.15em] border-b border-graphite pb-4 mb-6">Estilo Tipográfico</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
              <label className={labelClass}>Fuente de Títulos (Headings)</label>
              <input type="text" name="heading_font" value={settings.heading_font || ''} onChange={handleInputChange} placeholder="Cormorant Garamond, serif..." className={inputClass} />
                </div>
                <div>
              <label className={labelClass}>Fuente de Párrafos (Body)</label>
              <input type="text" name="body_font" value={settings.body_font || ''} onChange={handleInputChange} placeholder="Inter, sans-serif..." className={inputClass} />
                </div>
            </div>
          <p className="text-[10px] text-mist/25 mt-4 font-sans">Asegúrate de que estas fuentes estén disponibles en Google Fonts.</p>
        </section>

        {/* HERO SECTION */}
        <section className="bg-charcoal border border-graphite p-8">
          <h2 className="text-sm font-serif text-champagne uppercase tracking-[0.15em] border-b border-graphite pb-4 mb-6">Portada Principal (Hero)</h2>
            <div className="space-y-6">
                <div>
              <label className={labelClass}>Título Principal</label>
              <input type="text" name="hero_title" value={settings.hero_title || ''} onChange={handleInputChange} className={`${inputClass} text-lg font-serif`} />
                </div>
                <div>
              <label className={labelClass}>Subtítulo Descriptivo</label>
              <input type="text" name="hero_subtitle" value={settings.hero_subtitle || ''} onChange={handleInputChange} className={inputClass} />
                </div>

            <div className="border-t border-graphite/50 pt-6">
              <label className={labelClass}>Fondo de Portada</label>
                    
              <div className="flex gap-6 mb-4">
                <label className="flex items-center gap-2 cursor-pointer font-sans uppercase text-[10px] tracking-wider text-mist/60">
                  <input type="radio" name="hero_background_type" value="image" checked={settings.hero_background_type === 'image'} onChange={handleInputChange} className="w-3 h-3 accent-champagne" />
                            Imagen Estática
                        </label>
                <label className="flex items-center gap-2 cursor-pointer font-sans uppercase text-[10px] tracking-wider text-mist/60">
                  <input type="radio" name="hero_background_type" value="video" checked={settings.hero_background_type === 'video'} onChange={handleInputChange} className="w-3 h-3 accent-champagne" />
                  Video Vimeo
                        </label>
                    </div>

                    {settings.hero_background_type === 'image' ? (
                        <div>
                            {!heroBgPreview ? (
                    <div className="relative border border-dashed border-graphite bg-obsidian p-6 text-center cursor-pointer hover:border-champagne/30 transition-colors duration-400">
                                <input type="file" accept="image/*" onChange={handleHeroBgChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      <UploadCloud size={20} className="mx-auto mb-2 text-mist/30" />
                      <p className="font-sans uppercase tracking-[0.15em] text-[10px] text-mist/40">Subir Imagen Fondo (1920x1080)</p>
                                </div>
                            ) : (
                      <div className="relative aspect-video bg-graphite border border-graphite flex items-center justify-center p-0 group overflow-hidden max-w-sm">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={heroBgPreview} alt="Hero Bg" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => { setHeroBgFile(null); setHeroBgPreview(null); setSettings({ ...settings, hero_background_url: null }); }} className="absolute top-2 right-2 bg-obsidian/80 border border-graphite w-8 h-8 flex items-center justify-center text-mist/60 hover:text-champagne transition-colors">
                          <X size={14} />
                                </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <input 
                                type="url" 
                                name="hero_background_url" 
                                value={settings.hero_background_url || ''} 
                                onChange={handleInputChange} 
                                placeholder="Ej: https://vimeo.com/76979871" 
                      className={inputClass} 
                            />
                    <p className="text-[10px] text-mist/25 mt-2 font-sans">Pega la URL del video de Vimeo. Se silenciará y repetirá en bucle.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>

        {/* FILOSOFÍA — Frases de Scroll */}
        <section className="bg-charcoal border border-graphite p-8">
          <h2 className="text-sm font-serif text-champagne uppercase tracking-[0.15em] border-b border-graphite pb-4 mb-6">Filosofía de Marca (Scroll Hero)</h2>
          <p className="text-[10px] text-mist/25 font-sans mb-6">
            Estas tres frases aparecen animadas mientras el usuario hace scroll en la portada, antes de llegar al resto del contenido.
          </p>

          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={settings.philosophy_enabled ?? true}
                onChange={(e) => setSettings({ ...settings, philosophy_enabled: e.target.checked })}
                className="w-4 h-4 accent-champagne cursor-pointer"
              />
              <span className="font-sans uppercase text-[10px] tracking-[0.2em] text-mist/60 group-hover:text-ivory transition-colors">
                Activar sección de filosofía
              </span>
            </label>
          </div>

          <div className={`space-y-6 transition-opacity duration-400 ${settings.philosophy_enabled === false ? 'opacity-30 pointer-events-none' : ''}`}>
            {[1, 2, 3].map((num) => {
              const key = `philosophy_phrase_${num}` as keyof GlobalSettings;
              return (
                <div key={num}>
                  <label className={labelClass}>
                    <span className="text-champagne/60 mr-2">{String(num).padStart(2, '0')}</span>
                    Frase {num}
                  </label>
                  <textarea
                    name={key}
                    value={(settings[key] as string) || ''}
                    onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                    rows={2}
                    className={`${inputClass} resize-none font-serif italic`}
                    placeholder={`Frase filosófica ${num}...`}
                  />
                </div>
              );
            })}
          </div>
        </section>

        {/* OTROS AJUSTES */}
        <section className="bg-charcoal border border-graphite p-8">
          <h2 className="text-sm font-serif text-champagne uppercase tracking-[0.15em] border-b border-graphite pb-4 mb-6">Contacto y Enrutamiento</h2>
            <div>
            <label className={labelClass}>Email de Contacto (Opcional)</label>
            <input type="email" name="contact_email" value={settings.contact_email || ''} onChange={handleInputChange} placeholder="ing.fajardo89@gmail.com" className={inputClass} />
            <p className="text-[10px] text-mist/25 mt-2 font-sans">Si lo dejas vacío, los mensajes se enviarán al configurado en el código fuente.</p>
            </div>
        </section>

        {/* Submit Bar */}
        <div className="fixed bottom-0 right-0 left-0 md:left-64 bg-charcoal border-t border-graphite p-4 flex justify-end z-50">
            <button 
              type="submit" 
              disabled={isLoading} 
            className="w-full md:w-auto bg-champagne text-obsidian px-8 py-4 font-sans uppercase tracking-[0.2em] text-xs hover:bg-gold-dust transition-colors duration-400 disabled:opacity-40 flex items-center justify-center gap-2"
            >
            {isLoading ? <><Loader2 size={14} className="animate-spin" /> Guardando Ajustes...</> : 'Guardar y Publicar Ajustes'}
            </button>
        </div>
      </form>
    </div>
  );
}
