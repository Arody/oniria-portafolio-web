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
      maxSizeMB: 0.1, // 100kb for blog covers
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

      // 1. Upload Cover Image if exists
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

      // 2. Obtain current user id
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No hay sesión activa");

      // 3. Generate unique slug based on title
      const uniqueSlug = await generateUniqueSlug(supabase, formData.title);

      // 4. Insert into database
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

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32">
      <div>
        <p className="text-sm font-bold uppercase tracking-widest text-brutalist-gray mb-2">
          Dashboard / Blog / Escribir
        </p>
        <h1 className="text-4xl font-black uppercase tracking-tighter text-brutalist-black">NUEVO ARTÍCULO</h1>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-900 p-4 text-red-900 text-sm font-bold uppercase">
          {error}
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e, false)}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            <div>
              <label className="block text-sm font-bold uppercase tracking-widest text-brutalist-black mb-2">Título del Artículo *</label>
              <input required type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Un título llamativo (SEO friendly)..." className="w-full p-4 border-2 border-brutalist-black bg-brutalist-white text-2xl font-black uppercase tracking-tighter focus:outline-none focus:ring-2 focus:ring-brutalist-black transition-shadow hover:shadow-[4px_4px_0_0_#000]" />
            </div>
            
            <div>
                <label className="block text-sm font-bold uppercase tracking-widest text-brutalist-black mb-2">Editor Visual (Bloques Mágicos)</label>
                <div className="w-full">
                  <RichTextEditor content={content} onChange={setContent} />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold uppercase tracking-widest text-brutalist-black mb-2">Extracto / Resumen Corto (Para SEO / Meta Description)</label>
                <textarea name="excerpt" value={formData.excerpt} onChange={handleInputChange} rows={3} placeholder="Un resumen de 2 líneas de lo que trata el artículo..." className="w-full p-4 border-2 border-brutalist-black bg-brutalist-white focus:outline-none focus:ring-2 focus:ring-brutalist-black resize-none transition-shadow hover:shadow-[4px_4px_0_0_#000]" />
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-8">
            <div>
              <h3 className="text-lg font-black uppercase tracking-widest text-brutalist-black mb-4">Imagen Principal (Thumbnail)</h3>
              
              {!coverImagePreview ? (
                <div className="relative border-4 border-dashed border-brutalist-black bg-gray-50 p-12 text-center cursor-pointer hover:bg-gray-100 transition-colors flex flex-col items-center justify-center">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <UploadCloud size={48} className="text-brutalist-black mb-4" />
                  <p className="font-bold uppercase tracking-widest text-sm text-brutalist-black">Selecciona la imagen</p>
                </div>
              ) : (
                <div className="relative aspect-video bg-gray-200 border-4 border-brutalist-black group overflow-hidden">
                  <img src={coverImagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => { setCoverImage(null); setCoverImagePreview(null); }}
                    className="absolute top-2 right-2 bg-brutalist-white border-2 border-brutalist-black w-8 h-8 flex items-center justify-center text-brutalist-black hover:bg-brutalist-black hover:text-brutalist-white transition-colors"
                  >
                    <X size={16} strokeWidth={3} />
                  </button>
                </div>
              )}
            </div>

            <hr className="border-2 border-brutalist-black" />

            <div className="space-y-6">
              <div>
                  <label className="block text-sm font-bold uppercase tracking-widest text-brutalist-black mb-2">Categoría Principal (Keywords)</label>
                  <input type="text" name="category" value={formData.category} onChange={handleInputChange} placeholder="Fotografía, Bodas, Tips..." className="w-full p-3 border-2 border-brutalist-black bg-brutalist-white focus:outline-none focus:ring-2 focus:ring-brutalist-black transition-shadow hover:shadow-[4px_4px_0_0_#000]" />
              </div>

              <div>
                  <label className="block text-sm font-bold uppercase tracking-widest text-brutalist-black mb-2">Visibilidad</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="w-full p-3 border-2 border-brutalist-black font-bold uppercase text-sm focus:outline-none focus:ring-2 focus:ring-brutalist-black bg-brutalist-white appearance-none cursor-pointer transition-shadow hover:shadow-[4px_4px_0_0_#000]">
                    <option value="draft">Borrador Oculto</option>
                    <option value="published">Público y Vivo</option>
                  </select>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Bar */}
        <div className="fixed bottom-0 right-0 left-0 md:left-64 bg-brutalist-white border-t-4 border-brutalist-black p-4 md:p-6 flex flex-col md:flex-row justify-end items-center gap-4 md:gap-6 z-40">
            <button type="button" onClick={() => router.back()} disabled={isLoading} className="font-bold uppercase tracking-widest text-sm text-brutalist-gray hover:text-brutalist-black hover:underline transition-all order-3 md:order-1 disabled:opacity-50">
              Cancelar
            </button>
            <button 
              type="button" 
              onClick={(e) => handleSubmit(e, true)}
              disabled={isLoading} 
              className="w-full md:w-auto bg-brutalist-white text-brutalist-black px-8 py-3 font-bold uppercase tracking-widest text-sm border-2 border-brutalist-black hover:bg-gray-100 transition-colors hover:shadow-[4px_4px_0_0_#000] order-2 disabled:opacity-50"
            >
              Guardar Borrador
            </button>
            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full md:w-auto bg-brutalist-black text-brutalist-white px-8 py-3 font-bold uppercase tracking-widest text-sm border-2 border-brutalist-black hover:bg-brutalist-white hover:text-brutalist-black transition-colors md:hover:shadow-[4px_4px_0_0_#000] order-1 md:order-3 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? <><Loader2 size={16} className="animate-spin" /> Procesando...</> : 'Publicar Artículo'}
            </button>
        </div>
      </form>
    </div>
  );
}
