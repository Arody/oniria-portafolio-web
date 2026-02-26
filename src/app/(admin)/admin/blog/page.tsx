import { getAllBlogPosts } from '@/core/services/blogService';
import Link from 'next/link';
import { DeleteBlogButton } from '@/ui/components/DeleteBlogButton';

export default async function AdminBlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">Dashboard / Blog</p>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-black">Artículos de Blog</h1>
        </div>
        <Link 
          href="/admin/blog/new" 
          className="bg-black text-white px-6 py-3 font-bold uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-colors brutalist-border brutalist-shadow-hover text-center"
        >
          + Escribir Artículo
        </Link>
      </div>

      <div className="bg-white brutalist-border overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black text-white uppercase text-sm font-bold tracking-widest">
              <th className="p-4 border-r-2 border-white">Título</th>
              <th className="p-4 border-r-2 border-white">Estado</th>
              <th className="p-4 border-r-2 border-white">Fecha</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest">
                  No hay artículos creados aún.
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="border-b-2 border-black hover:bg-gray-50 transition-colors">
                  <td className="p-4 border-r-2 border-black font-medium">
                    {post.title}
                    <div className="text-xs text-gray-500 mt-1">/{post.slug}</div>
                  </td>
                  <td className="p-4 border-r-2 border-black">
                    <span className={`px-2 py-1 text-xs font-bold uppercase tracking-widest ${post.status === 'published' ? 'bg-black text-white' : 'bg-gray-200 text-black'}`}>
                      {post.status === 'published' ? 'Publicado' : 'Borrador'}
                    </span>
                  </td>
                  <td className="p-4 border-r-2 border-black text-sm uppercase font-bold text-gray-600">
                    {new Date(post.created_at).toLocaleDateString('es-MX')}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Link href={`/admin/blog/${post.id}`} className="px-3 py-1 font-bold uppercase text-xs tracking-widest brutalist-border hover:bg-black hover:text-white transition-colors">Editar</Link>
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
