import { getAllProjects } from '@/core/services/portfolioService';
import Link from 'next/link';
import { DeleteProjectButton } from '@/ui/components/DeleteProjectButton';

export default async function AdminPortfolioPage() {
  const projects = await getAllProjects();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h1 className="text-3xl font-serif font-light text-ivory uppercase tracking-[0.1em]">Gestión de Portafolio</h1>
        <Link href="/admin/portfolio/new" className="bg-champagne text-obsidian px-8 py-3 font-sans uppercase tracking-[0.2em] text-xs hover:bg-gold-dust transition-colors duration-400 whitespace-nowrap text-center">
          Nuevo Proyecto +
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <input 
          type="text" 
          placeholder="Buscar proyecto..." 
          className="flex-grow p-3 bg-charcoal border border-graphite text-ivory font-sans text-sm placeholder:text-mist/20 focus:outline-none focus:border-champagne/50 transition-colors duration-400"
        />
        <select className="p-3 bg-charcoal border border-graphite text-ivory font-sans uppercase text-xs tracking-[0.1em] focus:outline-none focus:border-champagne/50 appearance-none cursor-pointer transition-colors duration-400">
          <option>Categoría: Todas</option>
          <option>Bodas</option>
          <option>Pre-boda</option>
          <option>Detalles</option>
          <option>Recepción</option>
        </select>
        <select className="p-3 bg-charcoal border border-graphite text-ivory font-sans uppercase text-xs tracking-[0.1em] focus:outline-none focus:border-champagne/50 appearance-none cursor-pointer transition-colors duration-400">
          <option>Estado: Todos</option>
          <option>Publicado</option>
          <option>Borrador</option>
        </select>
      </div>

      {/* Table Section */}
      <div className="bg-charcoal border border-graphite overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-graphite bg-graphite/30">
              <th className="p-4 w-16"></th>
              <th className="p-4 font-sans uppercase text-[10px] tracking-[0.2em] text-mist/50">Título</th>
              <th className="p-4 font-sans uppercase text-[10px] tracking-[0.2em] text-mist/50">Pareja</th>
              <th className="p-4 font-sans uppercase text-[10px] tracking-[0.2em] text-mist/50">Ubicación</th>
              <th className="p-4 font-sans uppercase text-[10px] tracking-[0.2em] text-mist/50">Categoría</th>
              <th className="p-4 font-sans uppercase text-[10px] tracking-[0.2em] text-mist/50">Fecha Evento</th>
              <th className="p-4 font-sans uppercase text-[10px] tracking-[0.2em] text-mist/50 text-center">Estado</th>
              <th className="p-4 font-sans uppercase text-[10px] tracking-[0.2em] text-mist/50 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-b border-graphite/50 hover:bg-graphite/20 transition-colors duration-300">
                <td className="p-4">
                  <div className="w-12 h-12 bg-graphite border border-graphite overflow-hidden relative">
                    {project.cover_image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                      <img src={project.cover_image_url} alt="cover" className="object-cover w-full h-full" />
                    )}
                  </div>
                </td>
                <td className="p-4 font-sans text-sm text-ivory">{project.title}</td>
                <td className="p-4 font-sans text-sm text-ivory">{project.couple_name}</td>
                <td className="p-4 text-sm font-sans text-mist/60">{project.location ?? '-'}</td>
                <td className="p-4 text-sm font-sans text-mist/50">{project.category ?? '-'}</td>
                <td className="p-4 text-sm font-sans text-mist/40">{project.event_date ? new Date(project.event_date).toLocaleDateString() : '-'}</td>
                <td className="p-4 text-center">
                  <span className={`inline-block px-3 py-1 text-[10px] font-sans uppercase tracking-[0.15em] border ${project.status === 'published' ? 'bg-champagne/10 text-champagne border-champagne/30' : 'bg-graphite/30 text-mist/50 border-graphite'
                      }`}>
                     {project.status === 'published' ? 'Publicado' : 'Borrador'}
                   </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <Link href={`/admin/portfolio/${project.id}`} className="px-3 py-1 font-sans uppercase text-[10px] tracking-[0.15em] border border-graphite text-mist/60 hover:border-champagne/50 hover:text-champagne transition-all duration-300">Editar</Link>
                  <DeleteProjectButton id={project.id} />
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
                <tr>
                <td colSpan={8} className="p-8 text-center text-mist/30 font-sans text-sm uppercase tracking-[0.15em]">
                        No hay proyectos registrados en el portafolio.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Placeholder */}
      <div className="flex justify-end gap-4 pb-12">
        <button className="px-6 py-2 font-sans uppercase text-[10px] tracking-[0.15em] border border-graphite text-mist/40 hover:border-mist/30 hover:text-mist/60 transition-all duration-300 disabled:opacity-30" disabled>Anterior</button>
        <button className="px-6 py-2 font-sans uppercase text-[10px] tracking-[0.15em] border border-graphite text-mist/40 hover:border-mist/30 hover:text-mist/60 transition-all duration-300 disabled:opacity-30" disabled>Siguiente</button>
      </div>
    </div>
  );
}
