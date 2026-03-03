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
    { label: 'Total Proyectos', value: projects.length.toString() },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <div key={i} className="bg-charcoal border border-graphite p-6 flex flex-col justify-between h-32 transition-all duration-400 hover:border-champagne/30">
            <h3 className="text-[10px] font-sans uppercase tracking-[0.2em] text-mist/50">{stat.label}</h3>
            <p className="text-4xl font-serif font-light text-ivory">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Projects Table */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-serif font-light text-ivory uppercase tracking-[0.1em]">Proyectos Recientes</h2>
          <div className="bg-charcoal border border-graphite overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-graphite bg-graphite/30">
                  <th className="p-4 font-sans uppercase text-[10px] tracking-[0.2em] text-mist/50">Pareja</th>
                  <th className="p-4 font-sans uppercase text-[10px] tracking-[0.2em] text-mist/50">Categoría</th>
                  <th className="p-4 font-sans uppercase text-[10px] tracking-[0.2em] text-mist/50">Fecha</th>
                  <th className="p-4 font-sans uppercase text-[10px] tracking-[0.2em] text-mist/50 text-right">Estado</th>
                </tr>
              </thead>
              <tbody>
                {projects.slice(0, 5).map((row) => (
                  <tr key={row.id} className="border-b border-graphite/50 hover:bg-graphite/20 transition-colors duration-300">
                    <td className="p-4 font-sans text-sm text-ivory">{row.couple_name}</td>
                    <td className="p-4 text-sm font-sans text-mist/60">{row.category}</td>
                    <td className="p-4 text-sm font-sans text-mist/40">{new Date(row.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <span className={`inline-block px-3 py-1 text-[10px] font-sans uppercase tracking-[0.15em] border ${row.status === 'published' ? 'bg-champagne/10 text-champagne border-champagne/30' : 'bg-graphite/30 text-mist/50 border-graphite'
                      }`}>
                        {row.status === 'published' ? 'Publicado' : 'Borrador'}
                      </span>
                    </td>
                  </tr>
                ))}
                {projects.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-mist/30 font-sans text-sm">No hay proyectos registrados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Messages */}
        <div className="space-y-6">
          <h2 className="text-lg font-serif font-light text-ivory uppercase tracking-[0.1em]">Mensajes Recientes</h2>
          <div className="bg-charcoal border border-graphite p-6 space-y-6">
             {messages.map((msg, i) => (
               <div key={msg.id} className={`pb-6 ${i !== messages.length - 1 ? 'border-b border-graphite/50' : ''}`}>
                 <div className="flex justify-between items-start mb-2">
                   <h4 className="font-sans text-sm text-ivory">{msg.full_name}</h4>
                   <span className="text-[10px] text-mist/40 font-sans tracking-wider">{new Date(msg.created_at).toLocaleDateString()}</span>
                 </div>
                 <p className="text-sm text-mist/50 font-sans truncate">{msg.message}</p>
                 <button className="mt-3 text-[10px] font-sans uppercase tracking-[0.2em] text-champagne hover:text-ivory transition-colors duration-300">Leer mensaje →</button>
               </div>
             ))}
             {messages.length === 0 && (
              <p className="text-sm text-mist/30 text-center font-sans">No hay mensajes recientes.</p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
