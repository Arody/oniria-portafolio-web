import { getAllBlogPosts } from '@/core/services/blogService';
import Link from 'next/link';
import { DeleteBlogButton } from '@/ui/components/DeleteBlogButton';

export default async function AdminBlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-mist/40 mb-2">Dashboard / Blog</p>
          <h1 className="text-3xl font-serif font-light text-ivory uppercase tracking-[0.1em]">Artículos de Blog</h1>
        </div>
        <Link 
          href="/admin/blog/new" 
          className="bg-champagne text-obsidian px-6 py-3 font-sans uppercase tracking-[0.2em] text-xs hover:bg-gold-dust transition-colors duration-400 text-center"
        >
          + Escribir Artículo
        </Link>
      </div>

      <div className="bg-charcoal border border-graphite overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-graphite/30 uppercase text-[10px] font-sans tracking-[0.2em] text-mist/50">
              <th className="p-4 border-r border-graphite/30">Título</th>
              <th className="p-4 border-r border-graphite/30">Estado</th>
              <th className="p-4 border-r border-graphite/30">Fecha</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-mist/30 font-sans uppercase tracking-[0.15em] text-sm">
                  No hay artículos creados aún.
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="border-b border-graphite/50 hover:bg-graphite/20 transition-colors duration-300">
                  <td className="p-4 border-r border-graphite/30 font-sans text-sm text-ivory">
                    {post.title}
                    <div className="text-[10px] text-mist/30 mt-1 font-sans">/{post.slug}</div>
                  </td>
                  <td className="p-4 border-r border-graphite/30">
                    <span className={`px-2 py-1 text-[10px] font-sans uppercase tracking-[0.15em] border ${post.status === 'published' ? 'bg-champagne/10 text-champagne border-champagne/30' : 'bg-graphite/30 text-mist/50 border-graphite'}`}>
                      {post.status === 'published' ? 'Publicado' : 'Borrador'}
                    </span>
                  </td>
                  <td className="p-4 border-r border-graphite/30 text-sm font-sans text-mist/40">
                    {new Date(post.created_at).toLocaleDateString('es-MX')}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Link href={`/admin/blog/${post.id}`} className="px-3 py-1 font-sans uppercase text-[10px] tracking-[0.15em] border border-graphite text-mist/60 hover:border-champagne/50 hover:text-champagne transition-all duration-300">Editar</Link>
                    <DeleteBlogButton id={post.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
