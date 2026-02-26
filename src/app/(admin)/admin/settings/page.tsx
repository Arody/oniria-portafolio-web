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

        if (error && error.code !== 'PGRST116') { // PGRST116 is row not found (which shouldn't happen due to default insert, but just in case)
             throw error;
        }

        if (data) {
          setSettings(data as GlobalSettings);
          setLogoPreview(data.logo_image_url);
          if (data.hero_background_type === 'image') {
              setHeroBgPreview(data.hero_background_url);
          }
        } else {
             // Fallback default structure
             setSettings({
                 id: 'default',
                 site_title: 'Oniria Weddings',
                 site_description: '',
                 logo_text: 'ONIRIA.',
                 logo_image_url: null,
                 heading_font: 'Cabinet Grotesk',
                 body_font: 'Inter',
                 hero_title: 'CREANDO RECUERDOS ATEMPORALES',
                 hero_subtitle: 'Fotografía Editorial',
                 hero_background_type: 'image',
                 hero_background_url: null,
                 contact_email: '',
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
      if (settings) setSettings({ ...settings, logo_image_url: '' }); // Mark for update
    }
  };

  const handleHeroBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setHeroBgFile(file);
      setHeroBgPreview(URL.createObjectURL(file));
      if (settings) setSettings({ ...settings, hero_background_url: '' }); // Mark for update
    }
  };

  const compressImage = async (file: File, isLogo: boolean = false) => {
    const options = {
      maxSizeMB: isLogo ? 0.05 : 0.5, // 50kb for logo, 500kb for hero
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

      // 1. Upload Logo if changed
      if (logoFile) {
        const compressedLogo = await compressImage(logoFile, true);
        const fileName = `logo-${Date.now()}.${compressedLogo.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage.from('oniria').upload(`settings/${fileName}`, compressedLogo);
        if (uploadError) throw uploadError;
        final_logo_url = supabase.storage.from('oniria').getPublicUrl(`settings/${fileName}`).data.publicUrl;
      }

      // 2. Upload Hero Bg if image changed and type is image
      if (heroBgFile && settings.hero_background_type === 'image') {
        const compressedBg = await compressImage(heroBgFile, false);
        const fileName = `hero-bg-${Date.now()}.${compressedBg.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage.from('oniria').upload(`settings/${fileName}`, compressedBg);
        if (uploadError) throw uploadError;
        final_hero_bg_url = supabase.storage.from('oniria').getPublicUrl(`settings/${fileName}`).data.publicUrl;
      }

      // 3. Update DB
      // We rely on the unique constraint or just updating the first matching row, 
      // but if the table is empty we might need to insert. We'll use upsert with a default UUID if needed,
      // but usually the first row is already there via the trigger/seed.
      
      const updatePayload = {
          site_title: settings.site_title,
          site_description: settings.site_description,
          logo_text: settings.logo_text,
          logo_image_url: final_logo_url,
          heading_font: settings.heading_font,
          body_font: settings.body_font,
          hero_title: settings.hero_title,
          hero_subtitle: settings.hero_subtitle,
          hero_background_type: settings.hero_background_type,
          hero_background_url: final_hero_bg_url,
          contact_email: settings.contact_email,
          updated_at: new Date().toISOString()
      };

      const { error: dbError } = await supabase
        .schema('oniria')
        .from('settings')
        .update(updatePayload)
        .eq('is_singleton', true); // Update the only row where is_singleton is true

      if (dbError) throw dbError;

      setSuccessMsg("Configuración global actualizada correctamente.");
      router.refresh();

    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al guardar la configuración');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
         <Loader2 className="w-8 h-8 animate-spin text-black" />
         <span className="ml-4 font-bold uppercase tracking-widest text-sm text-gray-500">Cargando Ajustes...</span>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32">
      <div>
        <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">Dashboard / Configuración</p>
        <h1 className="text-4xl font-black uppercase tracking-tighter text-black">Ajustes Globales</h1>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-900 p-4 text-red-900 text-sm font-bold uppercase">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="bg-green-50 border-2 border-green-900 p-4 text-green-900 text-sm font-bold uppercase">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-12">
        
        {/* IDENTIDAD DEL SITIO */}
        <section className="bg-white border-4 border-black p-8 brutalist-shadow">
            <h2 className="text-2xl font-black uppercase border-b-4 border-black pb-2 mb-6">Identidad Comercial (SEO & Logo)</h2>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold uppercase tracking-widest mb-2">Título de la Web</label>
                        <input type="text" name="site_title" value={settings.site_title || ''} onChange={handleInputChange} className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold uppercase tracking-widest mb-2">Descripción (Para Google)</label>
                        <input type="text" name="site_description" value={settings.site_description || ''} onChange={handleInputChange} className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start border-t-2 border-dashed border-gray-300 pt-6">
                    <div>
                        <label className="block text-sm font-bold uppercase tracking-widest mb-2">Logo de Texto (Fallback)</label>
                        <input type="text" name="logo_text" value={settings.logo_text || ''} onChange={handleInputChange} placeholder="ONIRIA." className="w-full p-3 border-2 border-black font-black uppercase text-xl focus:outline-none focus:ring-2 focus:ring-black" />
                        <p className="text-xs text-gray-500 mt-2 font-bold uppercase">Se usará si no subes una imagen de logo.</p>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold uppercase tracking-widest mb-2">Imagen de Logo (Menú / Navbar)</label>
                        {!logoPreview ? (
                            <div className="relative border-2 border-dashed border-black bg-gray-50 p-6 text-center cursor-pointer hover:bg-gray-100 transition-colors">
                            <input type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            <UploadCloud size={24} className="mx-auto mb-2 text-black" />
                            <p className="font-bold uppercase tracking-widest text-xs">Subir Logo (PNG/SVG)</p>
                            </div>
                        ) : (
                            <div className="relative h-20 bg-gray-100 border-2 border-black flex items-center justify-center p-2 group overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={logoPreview} alt="Logo" className="max-h-full max-w-full object-contain mix-blend-multiply" />
                            <button type="button" onClick={() => { setLogoFile(null); setLogoPreview(null); setSettings({ ...settings, logo_image_url: null }); }} className="absolute top-1 right-1 bg-white border-2 border-black w-6 h-6 flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                                <X size={12} strokeWidth={3} />
                            </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>

        {/* TIPOGRAFIA */}
        <section className="bg-white border-4 border-black p-8 brutalist-shadow">
            <h2 className="text-2xl font-black uppercase border-b-4 border-black pb-2 mb-6">Estilo Tipográfico</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold uppercase tracking-widest mb-2">Fuente de Títulos (Headings)</label>
                    <input type="text" name="heading_font" value={settings.heading_font || ''} onChange={handleInputChange} placeholder="Cabinet Grotesk, Inter, Arial..." className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
                <div>
                    <label className="block text-sm font-bold uppercase tracking-widest mb-2">Fuente de Párrafos (Body)</label>
                    <input type="text" name="body_font" value={settings.body_font || ''} onChange={handleInputChange} placeholder="Inter, sans-serif..." className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
            </div>
            <p className="text-xs text-gray-500 mt-4 font-bold uppercase">Asegúrate de que estas fuentes estén disponibles en Google Fonts o enlazadas en tu CSS global para que el cambio sea visible.</p>
        </section>

        {/* HERO SECTION (PORTADA PRINCIPAL) */}
        <section className="bg-white border-4 border-black p-8 bg-gray-50 brutalist-shadow">
            <h2 className="text-2xl font-black uppercase border-b-4 border-black pb-2 mb-6">Portada Principal (Hero)</h2>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold uppercase tracking-widest mb-2">Título Principal Tridimensional</label>
                    <input type="text" name="hero_title" value={settings.hero_title || ''} onChange={handleInputChange} className="w-full p-4 text-xl font-black uppercase border-2 border-black focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
                <div>
                    <label className="block text-sm font-bold uppercase tracking-widest mb-2">Subtítulo Descriptivo</label>
                    <input type="text" name="hero_subtitle" value={settings.hero_subtitle || ''} onChange={handleInputChange} className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black" />
                </div>

                <div className="border-t-2 border-dashed border-gray-400 pt-6">
                    <label className="block text-sm font-bold uppercase tracking-widest mb-4">Fondo de Portada</label>
                    
                    <div className="flex gap-4 mb-4">
                        <label className="flex items-center gap-2 cursor-pointer font-bold uppercase text-sm">
                            <input type="radio" name="hero_background_type" value="image" checked={settings.hero_background_type === 'image'} onChange={handleInputChange} className="w-4 h-4 text-black border-black focus:ring-black accent-black" />
                            Imagen Estática
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer font-bold uppercase text-sm">
                            <input type="radio" name="hero_background_type" value="video" checked={settings.hero_background_type === 'video'} onChange={handleInputChange} className="w-4 h-4 text-black border-black focus:ring-black accent-black" />
                            Video Vimeo (Auto-loop)
                        </label>
                    </div>

                    {settings.hero_background_type === 'image' ? (
                        <div>
                            {!heroBgPreview ? (
                                <div className="relative border-2 border-dashed border-black bg-white p-6 text-center cursor-pointer hover:bg-gray-100 transition-colors">
                                <input type="file" accept="image/*" onChange={handleHeroBgChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                <UploadCloud size={24} className="mx-auto mb-2 text-black" />
                                <p className="font-bold uppercase tracking-widest text-xs">Subir Imagen Fondo (Recomendado 1920x1080)</p>
                                </div>
                            ) : (
                                <div className="relative aspect-video bg-gray-200 border-2 border-black flex items-center justify-center p-0 group overflow-hidden max-w-sm">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={heroBgPreview} alt="Hero Bg" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => { setHeroBgFile(null); setHeroBgPreview(null); setSettings({ ...settings, hero_background_url: null }); }} className="absolute top-2 right-2 bg-white border-2 border-black w-8 h-8 flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                                    <X size={16} strokeWidth={3} />
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
                                className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black" 
                            />
                            <p className="text-xs text-gray-500 mt-2 font-bold uppercase">Pega la URL del video de Vimeo. Se silenciará y repetirá en bucle detrás del título.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>

        {/* OTROS AJUSTES */}
        <section className="bg-white border-4 border-black p-8 brutalist-shadow">
            <h2 className="text-2xl font-black uppercase border-b-4 border-black pb-2 mb-6">Contacto y Enrutamiento</h2>
            <div>
                <label className="block text-sm font-bold uppercase tracking-widest mb-2">Omitir "Recepcionista" Email (Opcional)</label>
                <input type="email" name="contact_email" value={settings.contact_email || ''} onChange={handleInputChange} placeholder="ing.fajardo89@gmail.com" className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black" />
                <p className="text-xs text-gray-500 mt-2 font-bold uppercase">Si lo dejas vacío, los mensajes del formulario web se enviarán al configurado en el código fuente.</p>
            </div>
        </section>

        {/* Submit Bar */}
        <div className="fixed bottom-0 right-0 left-0 md:left-64 bg-white border-t-4 border-black p-4 flex justify-end z-50">
            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full md:w-auto bg-black text-white px-8 py-4 font-black uppercase tracking-widest text-sm border-4 border-black hover:bg-white hover:text-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2 brutalist-shadow-hover"
            >
              {isLoading ? <><Loader2 size={16} className="animate-spin" /> Guardando Ajustes...</> : 'Guardar y Publicar Ajustes'}
            </button>
        </div>
      </form>
    </div>
  );
}
