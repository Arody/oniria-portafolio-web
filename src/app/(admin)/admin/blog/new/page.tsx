'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import imageCompression from 'browser-image-compression';
import { Loader2, UploadCloud, X } from 'lucide-react';
import { RichTextEditor } from '@/ui/components/RichTextEditor';
import { generateUniqueSlug } from '@/core/utils/slugUtils';

export default function AdminNewBlogPostPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    category: '',
    status: 'published',
  });

  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
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
      maxSizeMB: 0.1,
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
      let final_cover_image_url = null;

      if (coverImage) {
        const compressedImage = await compressImage(coverImage);
        const fileExt = compressedImage.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `blog/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('oniria')
          .upload(filePath, compressedImage, { cacheControl: '3600', upsert: false });

        if (uploadError) throw new Error(`Error al subir imagen: ${uploadError.message}`);

        const { data: { publicUrl } } = supabase.storage
          .from('oniria')
          .getPublicUrl(filePath);
        
        final_cover_image_url = publicUrl;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No hay sesión activa");

      const uniqueSlug = await generateUniqueSlug(supabase, formData.title);

      const { error: dbError } = await supabase
        .from('blog_posts')
        .insert({
          title: formData.title,
          slug: uniqueSlug,
          excerpt: formData.excerpt || null,
          content: content || null,
          category: formData.category || null,
          status: isDraft ? 'draft' : formData.status,
          cover_image_url: final_cover_image_url,
          author_id: session.user.id,
        });

      if (dbError) throw new Error(`Error guardando en base de datos: ${dbError.message}`);

      router.push('/admin/blog');
      router.refresh();

    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full p-4 bg-obsidian border border-graphite text-ivory font-sans text-sm placeholder:text-mist/20 focus:outline-none focus:border-champagne/50 transition-colors duration-400";
  const labelClass = "block text-[10px] font-sans uppercase tracking-[0.2em] text-mist/50 mb-3";

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32">
      <div>
        <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-mist/40 mb-2">
          Dashboard / Blog / Escribir
        </p>
        <h1 className="text-3xl font-serif font-light text-ivory uppercase tracking-[0.1em]">Nuevo Artículo</h1>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 p-4 text-red-400 text-sm font-sans">
          {error}
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e, false)}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            <div>
              <label className={labelClass}>Título del Artículo *</label>
              <input required type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Un título llamativo..." className={`${inputClass} text-xl font-serif`} />
            </div>
            
            <div>
              <label className={labelClass}>Editor Visual</label>
                <div className="w-full">
                  <RichTextEditor content={content} onChange={setContent} />
                </div>
            </div>

            <div>
              <label className={labelClass}>Extracto / Resumen Corto (SEO)</label>
              <textarea name="excerpt" value={formData.excerpt} onChange={handleInputChange} rows={3} placeholder="Un resumen de 2 líneas..." className={`${inputClass} resize-none`} />
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-8">
            <div>
              <h3 className="text-xs font-sans uppercase tracking-[0.2em] text-champagne mb-4">Imagen Principal</h3>
              
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
                <label className={labelClass}>Categoría Principal</label>
                <input type="text" name="category" value={formData.category} onChange={handleInputChange} placeholder="Fotografía, Bodas, Tips..." className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Visibilidad</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className={`${inputClass} appearance-none cursor-pointer`}>
                    <option value="draft">Borrador Oculto</option>
                    <option value="published">Público y Vivo</option>
                  </select>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Bar */}
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
              Guardar Borrador
            </button>
            <button 
              type="submit" 
              disabled={isLoading} 
            className="w-full md:w-auto bg-champagne text-obsidian px-8 py-3 font-sans uppercase tracking-[0.2em] text-[10px] hover:bg-gold-dust transition-colors duration-400 order-1 md:order-3 disabled:opacity-40 flex items-center justify-center gap-2"
            >
            {isLoading ? <><Loader2 size={14} className="animate-spin" /> Procesando...</> : 'Publicar Artículo'}
            </button>
        </div>
      </form>
    </div>
  );
}
