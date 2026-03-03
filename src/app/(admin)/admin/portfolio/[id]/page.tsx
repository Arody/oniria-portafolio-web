'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import imageCompression from 'browser-image-compression';
import { Loader2, UploadCloud, X } from 'lucide-react';
import { use } from 'react';

export default function AdminEditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    couple_name: '',
    location: '',
    event_date: '',
    category: 'Bodas',
    description: '',
    video_url: '',
    status: 'draft',
    display_order: 0,
  });

  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);

  useEffect(() => {
    async function loadProject() {
      try {
        const { data, error } = await supabase
          .from('portfolio_projects')
          .select('*')
          .eq('id', resolvedParams.id)
          .single();

        if (error) throw error;

        if (data) {
          setFormData({
            title: data.title || '',
            couple_name: data.couple_name || '',
            location: data.location || '',
            event_date: data.event_date ? new Date(data.event_date).toISOString().split('T')[0] : '',
            category: data.category || 'Bodas',
            description: data.description || '',
            video_url: data.video_url || '',
            status: data.status || 'draft',
            display_order: data.display_order || 0,
          });
          setCoverImagePreview(data.cover_image_url);
        }
      } catch (err: any) {
        setError('Error al cargar el proyecto: ' + err.message);
      } finally {
        setIsFetching(false);
      }
    }

    loadProject();
  }, [resolvedParams.id, supabase]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'video_url' && value.includes('<iframe') && value.includes('src=')) {
      const match = value.match(/src="([^"]+)"/);
      if (match && match[1]) {
        setFormData((prev) => ({ ...prev, [name]: match[1] }));
        return;
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImage(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };

  const compressImage = async (file: File) => {
    const options = {
      maxSizeMB: 0.07,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      initialQuality: 0.8,
    };
    try {
      return await imageCompression(file, options);
    } catch (error) {
      console.error('Error compressing image:', error);
      throw new Error('Error al comprimir la imagen');
    }
  };

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let final_cover_image_url = coverImagePreview;

      if (coverImage) {
        const compressedImage = await compressImage(coverImage);
        const fileExt = compressedImage.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `portfolio/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('oniria')
          .upload(filePath, compressedImage, { cacheControl: '3600', upsert: false });

        if (uploadError) throw new Error(`Error al subir imagen: ${uploadError.message}`);

        const { data: { publicUrl } } = supabase.storage
          .from('oniria')
          .getPublicUrl(filePath);
        
        final_cover_image_url = publicUrl;
      }

      const { error: dbError } = await supabase
        .from('portfolio_projects')
        .update({
          title: formData.title,
          couple_name: formData.couple_name,
          location: formData.location || null,
          event_date: formData.event_date || null,
          category: formData.category,
          description: formData.description || null,
          video_url: formData.video_url || null,
          status: isDraft ? 'draft' : formData.status,
          display_order: Number(formData.display_order),
          cover_image_url: final_cover_image_url,
        })
        .eq('id', resolvedParams.id);

      if (dbError) throw new Error(`Error al actualizar en base de datos: ${dbError.message}`);

      router.push('/admin/portfolio');
      router.refresh();

    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado');
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
        <span className="ml-4 font-sans uppercase tracking-[0.15em] text-[10px] text-mist/40">Cargando proyecto...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32">
      <div>
        <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-mist/40 mb-2">
          Dashboard / Portafolio / Editar Proyecto
        </p>
        <h1 className="text-3xl font-serif font-light text-ivory uppercase tracking-[0.1em]">Editar Proyecto</h1>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 p-4 text-red-400 text-sm font-sans">
          {error}
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e, false)}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-6">
            <div>
              <label className={labelClass}>Título del Proyecto *</label>
              <input required type="text" name="title" value={formData.title} onChange={handleInputChange} className={inputClass} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Nombre de la Pareja *</label>
                <input required type="text" name="couple_name" value={formData.couple_name} onChange={handleInputChange} placeholder="Ej. María & Carlos" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Ubicación</label>
                <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="Ej. Cancún, QR" className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Fecha del Evento</label>
                <input type="date" name="event_date" value={formData.event_date} onChange={handleInputChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Categoría</label>
                <select name="category" value={formData.category} onChange={handleInputChange} className={`${inputClass} appearance-none cursor-pointer`}>
                    <option value="Bodas">Bodas</option>
                    <option value="Pre-boda">Pre-boda</option>
                    <option value="Detalles">Detalles</option>
                    <option value="Recepción">Recepción</option>
                  </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>URL del Video (Vimeo / YouTube) *</label>
              <input required type="text" name="video_url" value={formData.video_url} onChange={handleInputChange} placeholder="Pega el link o el <iframe> completo de Vimeo..." className={inputClass} />
              <p className="text-[10px] text-mist/30 mt-2 font-sans tracking-wider">Puedes pegar el enlace directo, o el código completo del {`<iframe />`}.</p>
            </div>

            <div>
              <label className={labelClass}>Descripción</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows={6} className={`${inputClass} resize-none`} />
            </div>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <div>
              <h3 className="text-xs font-sans uppercase tracking-[0.2em] text-champagne mb-4">Imagen de Portada</h3>
              
              {!coverImagePreview ? (
                <div className="relative border border-dashed border-graphite bg-charcoal p-12 text-center cursor-pointer hover:border-champagne/30 transition-colors duration-400 flex flex-col items-center justify-center">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <UploadCloud size={36} className="text-mist/30 mb-4" />
                  <p className="font-sans uppercase tracking-[0.15em] text-[10px] text-mist/50">Selecciona la imagen</p>
                </div>
              ) : (
                  <div className="relative aspect-video bg-graphite border border-graphite group overflow-hidden">
                  <img src={coverImagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => { setCoverImage(null); setCoverImagePreview(null); }}
                      className="absolute top-2 right-2 bg-obsidian/80 border border-graphite w-8 h-8 flex items-center justify-center text-mist/60 hover:text-champagne hover:border-champagne/50 transition-all duration-300"
                  >
                      <X size={14} />
                  </button>
                </div>
              )}
            </div>

            <div className="h-px bg-graphite" />

            <div className="space-y-6">
              <div>
                <label className={labelClass}>Estado</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className={`${inputClass} appearance-none cursor-pointer`}>
                    <option value="draft">Borrador</option>
                    <option value="published">Publicado</option>
                  </select>
              </div>
              
              <div>
                <label className={labelClass}>Orden de Visualización</label>
                <input type="number" name="display_order" value={formData.display_order} onChange={handleInputChange} min={0} className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 right-0 left-0 md:left-64 bg-charcoal border-t border-graphite p-4 md:p-6 flex flex-col md:flex-row justify-end items-center gap-4 md:gap-6 z-40">
          <button type="button" onClick={() => router.back()} disabled={isLoading} className="font-sans uppercase tracking-[0.15em] text-[10px] text-mist/40 hover:text-ivory transition-colors duration-300 order-3 md:order-1 disabled:opacity-50">
              Cancelar
            </button>
            <button 
              type="button" 
              onClick={(e) => handleSubmit(e, true)}
              disabled={isLoading} 
            className="w-full md:w-auto bg-transparent text-ivory px-8 py-3 font-sans uppercase tracking-[0.2em] text-[10px] border border-graphite hover:border-mist/30 transition-all duration-300 order-2 disabled:opacity-50"
            >
              Convertir a Borrador
            </button>
            <button 
              type="submit" 
              disabled={isLoading} 
            className="w-full md:w-auto bg-champagne text-obsidian px-8 py-3 font-sans uppercase tracking-[0.2em] text-[10px] hover:bg-gold-dust transition-colors duration-400 order-1 md:order-3 disabled:opacity-40 flex items-center justify-center gap-2"
            >
            {isLoading ? <><Loader2 size={14} className="animate-spin" /> Procesando...</> : 'Actualizar Proyecto'}
            </button>
        </div>
      </form>
    </div>
  );
}
