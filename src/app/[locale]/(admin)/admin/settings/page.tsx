'use client';

import { ContentTranslations } from '@/ui/components/ContentTranslations';
import { SETTINGS_TEXT_FIELDS } from '@/core/utils/localization';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import imageCompression from 'browser-image-compression';
import { Loader2, UploadCloud, X } from 'lucide-react';
import type { GlobalSettings } from '@/core/services/settingsService';
import { revalidateGlobalSettings } from '@/core/actions/settingsActions';
import { EditorialCollage } from '@/ui/views/EditorialCollage';
import { AboutSettings } from '@/ui/components/AboutSettings';
import { ABOUT_TEXT_LIMITS, isAboutVimeoUrl, type AboutTextKey } from '@/core/utils/aboutContent';
import es from '@/lib/dictionaries/es.json';
import en from '@/lib/dictionaries/en.json';

export default function AdminSettingsPage() {
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();
  const collageDict = (locale === 'en' ? en : es).editorial_collage;
  const heroDict = (locale === 'en' ? en : es).hero.controls;
  const aboutDict = (locale === 'en' ? en : es).about;
  const aboutAdmin = (locale === 'en' ? en : es).about_admin;
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

  const [interlude1BgPreview, setInterlude1BgPreview] = useState<string | null>(null);
  const [interlude1BgFile, setInterlude1BgFile] = useState<File | null>(null);

  const [interlude2BgPreview, setInterlude2BgPreview] = useState<string | null>(null);
  const [interlude2BgFile, setInterlude2BgFile] = useState<File | null>(null);

  const [collage1File, setCollage1File] = useState<File | null>(null);
  const [collage2File, setCollage2File] = useState<File | null>(null);
  const [collage1Preview, setCollage1Preview] = useState<string | null>(null);
  const [collage2Preview, setCollage2Preview] = useState<string | null>(null);
  const [aboutFile, setAboutFile] = useState<File | null>(null);
  const [aboutPreview, setAboutPreview] = useState<string | null>(null);
  useEffect(() => () => { if (aboutPreview) URL.revokeObjectURL(aboutPreview); }, [aboutPreview]);

  const handleAboutImage = (file: File | undefined) => {
    if (file && (!['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'].includes(file.type) || file.size > 10 * 1024 * 1024)) {
      setError(collageDict.admin.invalid_image);
      return;
    }
    setError(null);
    setAboutFile(file ?? null);
    setAboutPreview(file ? URL.createObjectURL(file) : null);
  };

  useEffect(() => () => { if (collage1Preview) URL.revokeObjectURL(collage1Preview); }, [collage1Preview]);
  useEffect(() => () => { if (collage2Preview) URL.revokeObjectURL(collage2Preview); }, [collage2Preview]);

  useEffect(() => {
    let active = true;
    async function loadSettings() {
      try {
        const { data, error } = await supabase
          .schema('oniria')
          .from('settings')
          .select('*')
          .limit(1)
          .single();

        if (!active) return;
        if (error && error.code !== 'PGRST116') {
             throw error;
        }

        if (data) {
          setSettings(data as GlobalSettings);
          setLogoPreview(data.logo_image_url);
          if (data.hero_background_type === 'image') {
              setHeroBgPreview(data.hero_background_url);
          }
          if (data.interlude_1_media_type !== 'video' && data.interlude_1_media_url) {
              setInterlude1BgPreview(data.interlude_1_media_url);
          }
          if (data.interlude_2_media_type !== 'video' && data.interlude_2_media_url) {
              setInterlude2BgPreview(data.interlude_2_media_url);
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
                 interlude_1_enabled: true,
                 interlude_1_quote: 'Cada historia de amor merece ser contada con la delicadeza de un susurro y la fuerza de lo eterno.',
                 interlude_1_subtitle: '— Filosofía Oniria',
                 interlude_1_accent: 'eterno',
                 interlude_1_media_type: 'image',
                 interlude_1_media_url: '/interludes/hands.png',
                 interlude_2_enabled: true,
                 interlude_2_quote: 'No capturamos momentos. Creamos fragmentos de eternidad que respirarán por siempre.',
                 interlude_2_subtitle: '— El Arte de Recordar',
                 interlude_2_accent: 'eternidad',
                 interlude_2_media_type: 'image',
                 interlude_2_media_url: '/interludes/veil.png',
                 updated_at: ''
             });
        }
      } catch (err: unknown) {
        if (active) setError('Error al cargar configuración: ' + (err instanceof Error ? err.message : 'No se pudo completar la operación'));
      } finally {
        if (active) setIsFetching(false);
      }
    }

    loadSettings();
    return () => { active = false; };
  }, [supabase]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

  const handleInterlude1BgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setInterlude1BgFile(file);
      setInterlude1BgPreview(URL.createObjectURL(file));
      if (settings) setSettings({ ...settings, interlude_1_media_url: '' });
    }
  };

  const handleInterlude2BgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setInterlude2BgFile(file);
      setInterlude2BgPreview(URL.createObjectURL(file));
      if (settings) setSettings({ ...settings, interlude_2_media_url: '' });
    }
  };

  const handleCollageImageChange = (file: File | undefined, index: number) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'].includes(file.type) || file.size > 10 * 1024 * 1024) {
      setError(collageDict.admin.invalid_image);
      return;
    }
    setError(null);
    if (index === 0) {
      setCollage1File(file);
      setCollage1Preview(URL.createObjectURL(file));
    } else {
      setCollage2File(file);
      setCollage2Preview(URL.createObjectURL(file));
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
      const aboutVideoUrl = settings.about_video_url?.trim() || null;
      if (settings.about_media_type === 'video' && (!aboutVideoUrl || !isAboutVimeoUrl(aboutVideoUrl))) throw new Error(aboutAdmin.invalid_video);
      let final_logo_url = settings.logo_image_url;
      let final_hero_bg_url = settings.hero_background_url;
      let final_interlude1_url = settings.interlude_1_media_url;
      let final_interlude2_url = settings.interlude_2_media_url;

      if (logoFile) {
        const compressedLogo = await compressImage(logoFile, true);
        const ext = compressedLogo.name.split('.').pop()?.toLowerCase() || 'png';
        const fileName = `logo-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('oniria').upload(
          `settings/${fileName}`,
          compressedLogo,
          { upsert: true, contentType: compressedLogo.type || 'image/png' }
        );
        if (uploadError) {
          throw new Error(`Error al subir Logo a Supabase Storage: ${uploadError.message}. Verifica los permisos de tu cuenta.`);
        }
        final_logo_url = supabase.storage.from('oniria').getPublicUrl(`settings/${fileName}`).data.publicUrl;
      }

      if (heroBgFile && settings.hero_background_type === 'image') {
        const compressedBg = await compressImage(heroBgFile, false);
        const ext = compressedBg.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `hero-bg-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('oniria').upload(
          `settings/${fileName}`,
          compressedBg,
          { upsert: true, contentType: compressedBg.type || 'image/jpeg' }
        );
        if (uploadError) {
          throw new Error(`Error al subir Fondo Hero a Supabase Storage: ${uploadError.message}. Verifica los permisos de tu cuenta.`);
        }
        final_hero_bg_url = supabase.storage.from('oniria').getPublicUrl(`settings/${fileName}`).data.publicUrl;
      }

      if (interlude1BgFile && settings.interlude_1_media_type !== 'video') {
        const compressed = await compressImage(interlude1BgFile, false);
        const ext = compressed.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `interlude-1-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('oniria').upload(
          `settings/${fileName}`,
          compressed,
          { upsert: true, contentType: compressed.type || 'image/jpeg' }
        );
        if (uploadError) {
          throw new Error(`Error al subir Imagen de Interludio 1 a Supabase Storage: ${uploadError.message}. Verifica los permisos de tu cuenta.`);
        }
        final_interlude1_url = supabase.storage.from('oniria').getPublicUrl(`settings/${fileName}`).data.publicUrl;
      }

      if (interlude2BgFile && settings.interlude_2_media_type !== 'video') {
        const compressed = await compressImage(interlude2BgFile, false);
        const ext = compressed.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `interlude-2-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('oniria').upload(
          `settings/${fileName}`,
          compressed,
          { upsert: true, contentType: compressed.type || 'image/jpeg' }
        );
        if (uploadError) {
          throw new Error(`Error al subir Imagen de Interludio 2 a Supabase Storage: ${uploadError.message}. Verifica los permisos de tu cuenta.`);
        }
        final_interlude2_url = supabase.storage.from('oniria').getPublicUrl(`settings/${fileName}`).data.publicUrl;
      }

      const collageUrls = [settings.collage_image_1_url, settings.collage_image_2_url];
      for (const [index, file] of [collage1File, collage2File].entries()) {
        if (!file) continue;
        const compressed = await compressImage(file);
        const path = `settings/collage-${index + 1}-${crypto.randomUUID()}.${compressed.name.split('.').pop()?.toLowerCase() || 'jpg'}`;
        const { error: uploadError } = await supabase.storage.from('oniria').upload(path, compressed, { contentType: compressed.type });
        if (uploadError) throw uploadError;
        collageUrls[index] = supabase.storage.from('oniria').getPublicUrl(path).data.publicUrl;
      }

      const updatePayload = {
          translations: settings.translations ?? {},
          ...Object.fromEntries((Object.keys(ABOUT_TEXT_LIMITS) as AboutTextKey[]).map(key => [`about_${key}`, settings[`about_${key}`] ?? null])),
          about_media_type: settings.about_media_type ?? 'image',
          about_image_url: settings.about_image_url?.trim() || null,
          about_video_url: aboutVideoUrl,
          site_title: settings.site_title,
          site_description: settings.site_description,
          logo_text: settings.logo_text,
          logo_image_url: final_logo_url,
          logo_size: Number(settings.logo_size),
          heading_font: settings.heading_font,
          body_font: settings.body_font,
          hero_title: settings.hero_title,
          hero_subtitle: settings.hero_subtitle,
          hero_text_enabled: settings.hero_text_enabled ?? true,
          hero_overlay_opacity: settings.hero_overlay_opacity ?? 50,
          hero_background_type: settings.hero_background_type,
          hero_background_url: final_hero_bg_url,
          contact_email: settings.contact_email,
          philosophy_phrase_1: settings.philosophy_phrase_1,
          philosophy_phrase_2: settings.philosophy_phrase_2,
          philosophy_phrase_3: settings.philosophy_phrase_3,
          philosophy_enabled: settings.philosophy_enabled ?? true,
          interlude_1_enabled: settings.interlude_1_enabled ?? true,
          interlude_1_quote: settings.interlude_1_quote,
          interlude_1_subtitle: settings.interlude_1_subtitle,
          interlude_1_accent: settings.interlude_1_accent,
          interlude_1_media_type: settings.interlude_1_media_type || 'image',
          interlude_1_media_url: final_interlude1_url,
          interlude_2_enabled: settings.interlude_2_enabled ?? true,
          interlude_2_quote: settings.interlude_2_quote,
          interlude_2_subtitle: settings.interlude_2_subtitle,
          interlude_2_accent: settings.interlude_2_accent,
          interlude_2_media_type: settings.interlude_2_media_type || 'image',
          interlude_2_media_url: final_interlude2_url,
          collage_image_1_url: collageUrls[0] ?? null,
          collage_image_2_url: collageUrls[1] ?? null,
          collage_grayscale_enabled: settings.collage_grayscale_enabled ?? true,
          collage_title: settings.collage_title ?? null,
          collage_text_1: settings.collage_text_1 ?? null,
          collage_text_2: settings.collage_text_2 ?? null,
          collage_text_3: settings.collage_text_3 ?? null,
          collage_text_4: settings.collage_text_4 ?? null,
          collage_text_5: settings.collage_text_5 ?? null,
          collage_text_6: settings.collage_text_6 ?? null,
          collage_signature: settings.collage_signature ?? null,
          updated_at: new Date().toISOString()
      };

      if (aboutFile && settings.about_media_type !== 'video') {
        const compressed = await compressImage(aboutFile);
        const path = `settings/about-${crypto.randomUUID()}.${compressed.name.split('.').pop()?.toLowerCase() || 'jpg'}`;
        const { error: uploadError } = await supabase.storage.from('oniria').upload(path, compressed, { contentType: compressed.type });
        if (uploadError) throw uploadError;
        updatePayload.about_image_url = supabase.storage.from('oniria').getPublicUrl(path).data.publicUrl;
      }

      const { data: updatedRows, error: dbError } = await supabase
        .from('settings')
        .upsert({ ...updatePayload, ...(settings.id === 'default' ? {} : { id: settings.id }), is_singleton: true }, { onConflict: 'is_singleton' })
        .select();

      if (dbError) throw dbError;

      if (!updatedRows || updatedRows.length === 0) {
        throw new Error("No se pudo actualizar la configuración en la base de datos (0 filas afectadas). Verifica los permisos de tu cuenta.");
      }

      setSettings(updatedRows[0] as GlobalSettings);
      setLogoPreview(updatedRows[0].logo_image_url);
      setHeroBgPreview(updatedRows[0].hero_background_url);
      setInterlude1BgPreview(updatedRows[0].interlude_1_media_url);
      setInterlude2BgPreview(updatedRows[0].interlude_2_media_url);
      await revalidateGlobalSettings();

      // Limpiar archivos en memoria tras subida exitosa
      setLogoFile(null);
      setHeroBgFile(null);
      setInterlude1BgFile(null);
      setInterlude2BgFile(null);
      setCollage1File(null);
      setCollage2File(null);
      setCollage1Preview(null);
      setCollage2Preview(null);
      setAboutFile(null);
      setAboutPreview(null);

      setSuccessMsg("Configuración global guardada y sincronizada en tiempo real.");
      router.refresh();

    } catch (err: unknown) {
      console.error('Error al guardar configuración:', err);
      setError((err instanceof Error ? err.message : 'No se pudo completar la operación') || 'Ocurrió un error al guardar la configuración');
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

  if (!settings) return <p role="alert" className="text-red-400">{error}</p>;

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
        <section id="hero-settings" className="bg-charcoal border border-graphite p-8">
          <h2 className="text-sm font-serif text-champagne uppercase tracking-[0.15em] border-b border-graphite pb-4 mb-6">Portada Principal (Hero)</h2>
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-3 text-sm text-mist cursor-pointer">
                  <input type="checkbox" name="hero_text_enabled" checked={settings.hero_text_enabled ?? true} disabled={isLoading} onChange={event => setSettings({ ...settings, hero_text_enabled: event.target.checked })} className="w-4 h-4 accent-champagne" aria-describedby="hero-text-hint" />
                  {heroDict.show_text}
                </label>
                <p id="hero-text-hint" className="text-xs text-mist/60 mt-3">{heroDict.show_text_hint}</p>
              </div>
              <div>
                <label htmlFor="hero-overlay-opacity" className={labelClass}>{heroDict.overlay}</label>
                <div className="flex items-center gap-4">
                  <input id="hero-overlay-opacity" name="hero_overlay_opacity" type="range" min={0} max={100} step={1} value={settings.hero_overlay_opacity ?? 50} disabled={isLoading} onChange={event => setSettings({ ...settings, hero_overlay_opacity: Number(event.target.value) })} aria-describedby="hero-overlay-hint" className="flex-1 min-w-0 accent-champagne cursor-pointer" />
                  <output htmlFor="hero-overlay-opacity" className="w-14 text-right text-sm tabular-nums text-ivory">{settings.hero_overlay_opacity ?? 50}%</output>
                </div>
                <p id="hero-overlay-hint" className="text-xs text-mist/60 mt-3">{heroDict.overlay_hint}</p>
              </div>
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

        <section id="collage-settings" className="bg-charcoal border border-graphite p-8" aria-labelledby="collage-settings-title">
          <h2 id="collage-settings-title" className="text-sm font-serif text-champagne uppercase tracking-[0.15em] border-b border-graphite pb-4 mb-6">{collageDict.admin.title}</h2>
          <p className="text-sm text-mist/60 mb-6">{collageDict.admin.description}</p>
          <fieldset disabled={isLoading} className="space-y-6">
            <label className="flex items-center gap-3 text-sm text-ivory cursor-pointer">
              <input type="checkbox" checked={settings.collage_grayscale_enabled ?? true} onChange={event => setSettings({ ...settings, collage_grayscale_enabled: event.target.checked })} className="w-4 h-4 accent-champagne" />
              {collageDict.admin.grayscale_enabled}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[collageDict.admin.image_1, collageDict.admin.image_2].map((label, index) => (
                <div key={index}>
                  <label className={labelClass}>
                    {label}
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" className={`${inputClass} mt-3 text-xs`} onChange={event => {
                      handleCollageImageChange(event.target.files?.[0], index);
                      event.target.value = '';
                    }} />
                  </label>
                  <button type="button" className="text-xs text-champagne underline underline-offset-4" onClick={() => {
                    if (index === 0) { setCollage1File(null); setCollage1Preview(null); }
                    else { setCollage2File(null); setCollage2Preview(null); }
                    setSettings({ ...settings, [index === 0 ? 'collage_image_1_url' : 'collage_image_2_url']: null });
                  }}>{collageDict.admin.restore_image}</button>
                </div>
              ))}
            </div>
            <p className="text-xs text-mist/60">{collageDict.admin.image_hint}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {([
                { key: 'collage_title', label: collageDict.admin.vertical_title, fallback: collageDict.title, limit: 48 },
                ...([1, 2, 3, 4, 5, 6] as const).map(number => ({ key: `collage_text_${number}` as const, label: `${collageDict.admin.caption} ${number}`, fallback: collageDict[`text_${number}`], limit: 80 })),
                { key: 'collage_signature', label: collageDict.admin.signature, fallback: collageDict.signature, limit: 80 },
              ] as const).map(({ key, label, fallback, limit }) => (
                <label key={key} className={labelClass}>
                  {label}
                  <input type="text" name={key} maxLength={limit} value={settings[key] ?? fallback} onChange={handleInputChange} className={`${inputClass} mt-3`} />
                </label>
              ))}
            </div>
          </fieldset>
          <p className="text-xs text-mist/60 mb-6">{collageDict.admin.save_hint}</p>
          <h3 className={labelClass}>{collageDict.admin.preview}</h3>
          <EditorialCollage settings={{ ...settings, collage_image_1_url: collage1Preview ?? settings.collage_image_1_url, collage_image_2_url: collage2Preview ?? settings.collage_image_2_url }} dict={collageDict} />
        </section>

        <AboutSettings settings={settings} onChange={setSettings} onImageFile={handleAboutImage}
          onResetImage={() => { handleAboutImage(undefined); setSettings({ ...settings, about_image_url: null }); }}
          imagePreview={aboutPreview} dict={aboutDict} admin={aboutAdmin} locale={locale === 'en' ? 'en' : 'es'} disabled={isLoading} />

        {/* INTERLUDIO 1 */}
        <section className="bg-charcoal border border-graphite p-8">
          <h2 className="text-sm font-serif text-champagne uppercase tracking-[0.15em] border-b border-graphite pb-4 mb-6">
            Pausa Editorial 1 (Entre Portada y Portafolio)
          </h2>
          <p className="text-[10px] text-mist/25 font-sans mb-6">
            Esta sección muestra una frase editorial de gran impacto acompañada de una fotografía o video en bucle de Vimeo con efecto parallax.
          </p>

          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={settings.interlude_1_enabled ?? true}
                onChange={(e) => setSettings({ ...settings, interlude_1_enabled: e.target.checked })}
                className="w-4 h-4 accent-champagne cursor-pointer"
              />
              <span className="font-sans uppercase text-[10px] tracking-[0.2em] text-mist/60 group-hover:text-ivory transition-colors">
                Mostrar Interludio 1 en la página
              </span>
            </label>
          </div>

          <div className={`space-y-6 transition-opacity duration-400 ${settings.interlude_1_enabled === false ? 'opacity-30 pointer-events-none' : ''}`}>
            <div>
              <label className={labelClass}>Frase Principal (Cita Editorial)</label>
              <textarea
                name="interlude_1_quote"
                value={settings.interlude_1_quote || ''}
                onChange={handleInputChange}
                rows={3}
                placeholder="Cada historia de amor merece ser contada con la delicadeza de un susurro y la fuerza de lo eterno."
                className={`${inputClass} resize-none font-serif text-base italic`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Subtítulo / Firma</label>
                <input
                  type="text"
                  name="interlude_1_subtitle"
                  value={settings.interlude_1_subtitle || ''}
                  onChange={handleInputChange}
                  placeholder="— Filosofía Oniria"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Palabra de Acento (Dorado Champagne)</label>
                <input
                  type="text"
                  name="interlude_1_accent"
                  value={settings.interlude_1_accent || ''}
                  onChange={handleInputChange}
                  placeholder="eterno"
                  className={inputClass}
                />
                <p className="text-[10px] text-mist/25 mt-2 font-sans">
                  Esta palabra se resaltará en dorado dentro de la frase.
                </p>
              </div>
            </div>

            <div className="border-t border-graphite/50 pt-6">
              <label className={labelClass}>Multimedia Lateral (Parallax)</label>
              <div className="flex gap-6 mb-4">
                <label className="flex items-center gap-2 cursor-pointer font-sans uppercase text-[10px] tracking-wider text-mist/60">
                  <input
                    type="radio"
                    name="interlude_1_media_type"
                    value="image"
                    checked={settings.interlude_1_media_type !== 'video'}
                    onChange={() => setSettings({ ...settings, interlude_1_media_type: 'image' })}
                    className="w-3 h-3 accent-champagne"
                  />
                  Imagen Estática
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-sans uppercase text-[10px] tracking-wider text-mist/60">
                  <input
                    type="radio"
                    name="interlude_1_media_type"
                    value="video"
                    checked={settings.interlude_1_media_type === 'video'}
                    onChange={() => setSettings({ ...settings, interlude_1_media_type: 'video' })}
                    className="w-3 h-3 accent-champagne"
                  />
                  Video Vimeo
                </label>
              </div>

              {settings.interlude_1_media_type !== 'video' ? (
                <div>
                  {!interlude1BgPreview ? (
                    <div className="relative border border-dashed border-graphite bg-obsidian p-6 text-center cursor-pointer hover:border-champagne/30 transition-colors duration-400">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleInterlude1BgChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <UploadCloud size={20} className="mx-auto mb-2 text-mist/30" />
                      <p className="font-sans uppercase tracking-[0.15em] text-[10px] text-mist/40">
                        Subir Imagen (JPG/PNG/WEBP)
                      </p>
                    </div>
                  ) : (
                    <div className="relative aspect-video bg-graphite border border-graphite flex items-center justify-center p-0 group overflow-hidden max-w-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={interlude1BgPreview} alt="Interludio 1" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setInterlude1BgFile(null);
                          setInterlude1BgPreview(null);
                          setSettings({ ...settings, interlude_1_media_url: null });
                        }}
                        className="absolute top-2 right-2 bg-obsidian/80 border border-graphite w-8 h-8 flex items-center justify-center text-mist/60 hover:text-champagne transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <input
                    type="url"
                    name="interlude_1_media_url"
                    value={settings.interlude_1_media_url || ''}
                    onChange={handleInputChange}
                    placeholder="Ej: https://vimeo.com/76979871"
                    className={inputClass}
                  />
                  <p className="text-[10px] text-mist/25 mt-2 font-sans">
                    Pega la URL del video de Vimeo. Se reproducirá en bucle, silenciado y con efecto parallax.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* INTERLUDIO 2 */}
        <section className="bg-charcoal border border-graphite p-8">
          <h2 className="text-sm font-serif text-champagne uppercase tracking-[0.15em] border-b border-graphite pb-4 mb-6">
            Pausa Editorial 2 (Entre Portafolio y Contacto)
          </h2>
          <p className="text-[10px] text-mist/25 font-sans mb-6">
            Esta sección sirve como transición emocional entre la galería de historias y el llamado a la acción / contacto.
          </p>

          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={settings.interlude_2_enabled ?? true}
                onChange={(e) => setSettings({ ...settings, interlude_2_enabled: e.target.checked })}
                className="w-4 h-4 accent-champagne cursor-pointer"
              />
              <span className="font-sans uppercase text-[10px] tracking-[0.2em] text-mist/60 group-hover:text-ivory transition-colors">
                Mostrar Interludio 2 en la página
              </span>
            </label>
          </div>

          <div className={`space-y-6 transition-opacity duration-400 ${settings.interlude_2_enabled === false ? 'opacity-30 pointer-events-none' : ''}`}>
            <div>
              <label className={labelClass}>Frase Principal (Cita Editorial)</label>
              <textarea
                name="interlude_2_quote"
                value={settings.interlude_2_quote || ''}
                onChange={handleInputChange}
                rows={3}
                placeholder="No capturamos momentos. Creamos fragmentos de eternidad que respirarán por siempre."
                className={`${inputClass} resize-none font-serif text-base italic`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Subtítulo / Firma</label>
                <input
                  type="text"
                  name="interlude_2_subtitle"
                  value={settings.interlude_2_subtitle || ''}
                  onChange={handleInputChange}
                  placeholder="— El Arte de Recordar"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Palabra de Acento (Dorado Champagne)</label>
                <input
                  type="text"
                  name="interlude_2_accent"
                  value={settings.interlude_2_accent || ''}
                  onChange={handleInputChange}
                  placeholder="eternidad"
                  className={inputClass}
                />
                <p className="text-[10px] text-mist/25 mt-2 font-sans">
                  Esta palabra se resaltará en dorado dentro de la frase.
                </p>
              </div>
            </div>

            <div className="border-t border-graphite/50 pt-6">
              <label className={labelClass}>Multimedia Lateral (Parallax)</label>
              <div className="flex gap-6 mb-4">
                <label className="flex items-center gap-2 cursor-pointer font-sans uppercase text-[10px] tracking-wider text-mist/60">
                  <input
                    type="radio"
                    name="interlude_2_media_type"
                    value="image"
                    checked={settings.interlude_2_media_type !== 'video'}
                    onChange={() => setSettings({ ...settings, interlude_2_media_type: 'image' })}
                    className="w-3 h-3 accent-champagne"
                  />
                  Imagen Estática
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-sans uppercase text-[10px] tracking-wider text-mist/60">
                  <input
                    type="radio"
                    name="interlude_2_media_type"
                    value="video"
                    checked={settings.interlude_2_media_type === 'video'}
                    onChange={() => setSettings({ ...settings, interlude_2_media_type: 'video' })}
                    className="w-3 h-3 accent-champagne"
                  />
                  Video Vimeo
                </label>
              </div>

              {settings.interlude_2_media_type !== 'video' ? (
                <div>
                  {!interlude2BgPreview ? (
                    <div className="relative border border-dashed border-graphite bg-obsidian p-6 text-center cursor-pointer hover:border-champagne/30 transition-colors duration-400">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleInterlude2BgChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <UploadCloud size={20} className="mx-auto mb-2 text-mist/30" />
                      <p className="font-sans uppercase tracking-[0.15em] text-[10px] text-mist/40">
                        Subir Imagen (JPG/PNG/WEBP)
                      </p>
                    </div>
                  ) : (
                    <div className="relative aspect-video bg-graphite border border-graphite flex items-center justify-center p-0 group overflow-hidden max-w-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={interlude2BgPreview} alt="Interludio 2" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setInterlude2BgFile(null);
                          setInterlude2BgPreview(null);
                          setSettings({ ...settings, interlude_2_media_url: null });
                        }}
                        className="absolute top-2 right-2 bg-obsidian/80 border border-graphite w-8 h-8 flex items-center justify-center text-mist/60 hover:text-champagne transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <input
                    type="url"
                    name="interlude_2_media_url"
                    value={settings.interlude_2_media_url || ''}
                    onChange={handleInputChange}
                    placeholder="Ej: https://vimeo.com/76979871"
                    className={inputClass}
                  />
                  <p className="text-[10px] text-mist/25 mt-2 font-sans">
                    Pega la URL del video de Vimeo. Se reproducirá en bucle, silenciado y con efecto parallax.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* OTROS AJUSTES */}
        <section className="bg-charcoal border border-graphite p-8">
          <h2 className="text-sm font-serif text-champagne uppercase tracking-[0.15em] border-b border-graphite pb-4 mb-6">Contacto y Enrutamiento</h2>
            <div>
            <label className={labelClass}>Email de Contacto (Opcional)</label>
            <input type="email" name="contact_email" value={settings.contact_email || ''} onChange={handleInputChange} placeholder="hello@oniriaweddings.com" className={inputClass} />
            <p className="text-[10px] text-mist/25 mt-2 font-sans">Si lo dejas vacío, las consultas se guardarán en Mensajes sin notificación por correo.</p>
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
        <ContentTranslations value={settings.translations} onChange={translations => setSettings({ ...settings, translations })} fields={SETTINGS_TEXT_FIELDS} base={settings} />
      </form>
    </div>
  );
}
