import { getAllProjects } from '@/core/services/portfolioService';
import { getPublishedBlogPosts } from '@/core/services/blogService';
import { getRecentMessages } from '@/core/services/messageService';

export default async function AdminDashboardPage() {
  const [projects, posts, messages] = await Promise.all([
    getAllProjects(),
    getPublishedBlogPosts(),
    getRecentMessages(5)
  ]);

  const publishedProjectsCount = projects.filter(p => p.status === 'published').length;

  const stats = [
    { label: 'Proyectos Publicados', value: publishedProjectsCount.toString() },
    { label: 'Artículos del Blog', value: posts.length.toString() },
    { label: 'Mensajes Nuevos', value: messages.filter(m => !m.is_read).length.toString() },
    { label: 'Total Proyectos', value: projects.length.toString() }, // Reemplazamos visitas mockeadas
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 border-4 border-black flex flex-col justify-between h-32 brutalist-shadow">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-600">{stat.label}</h3>
            <p className="text-4xl font-black">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Recent Projects Table */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-black uppercase tracking-tighter">Proyectos Recientes</h2>
          <div className="bg-white border-4 border-black overflow-hidden relative">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-4 border-black bg-gray-100">
                  <th className="p-4 font-bold uppercase text-xs tracking-widest">Pareja</th>
                  <th className="p-4 font-bold uppercase text-xs tracking-widest">Categoría</th>
                  <th className="p-4 font-bold uppercase text-xs tracking-widest">Fecha</th>
                  <th className="p-4 font-bold uppercase text-xs tracking-widest text-right">Estado</th>
                </tr>
              </thead>
              <tbody>
                {projects.slice(0, 5).map((row) => (
                  <tr key={row.id} className="border-b-2 border-gray-200 hover:bg-gray-50">
                    <td className="p-4 font-bold">{row.couple_name}</td>
                    <td className="p-4 text-sm font-medium">{row.category}</td>
                    <td className="p-4 text-sm text-gray-500">{new Date(row.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <span className={`inline-block px-3 py-1 text-xs font-bold uppercase border-2 border-black ${
                        row.status === 'published' ? 'bg-black text-white' : 'bg-gray-200 text-black'
                      }`}>
                        {row.status === 'published' ? 'Publicado' : 'Borrador'}
                      </span>
                    </td>
                  </tr>
                ))}
                {projects.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500 font-medium">No hay proyectos registrados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Messages */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black uppercase tracking-tighter">Mensajes Recientes</h2>
          <div className="bg-white border-4 border-black p-6 space-y-6">
             {messages.map((msg, i) => (
               <div key={msg.id} className={`pb-6 ${i !== messages.length - 1 ? 'border-b-2 border-dashed border-gray-300' : ''}`}>
                 <div className="flex justify-between items-start mb-2">
                   <h4 className="font-bold text-sm uppercase">{msg.full_name}</h4>
                   <span className="text-xs text-gray-500 font-bold">{new Date(msg.created_at).toLocaleDateString()}</span>
                 </div>
                 <p className="text-sm text-gray-600 truncate">{msg.message}</p>
                 <button className="mt-3 text-xs font-bold uppercase tracking-widest hover:underline">Leer mensaje →</button>
               </div>
             ))}
             {messages.length === 0 && (
               <p className="text-sm text-gray-500 text-center">No hay mensajes recientes.</p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
