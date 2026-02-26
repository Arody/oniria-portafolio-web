'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

export function DeleteBlogButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta entrada de blog? Esta acción no se puede deshacer.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) throw error;
      
      router.refresh();
    } catch (err: any) {
      alert(`Error al eliminar: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="px-3 py-1 font-bold uppercase text-xs tracking-widest brutalist-border text-red-600 hover:bg-red-600 hover:text-white border-red-600 transition-colors disabled:opacity-50"
    >
      {isDeleting ? <Loader2 size={14} className="animate-spin inline" /> : 'Eliminar'}
    </button>
  );
}
