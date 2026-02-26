import { getAllProjects } from '@/core/services/portfolioService';
import Link from 'next/link';
import { DeleteProjectButton } from '@/ui/components/DeleteProjectButton';

export default async function AdminPortfolioPage() {
  const projects = await getAllProjects();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h1 className="text-4xl font-black uppercase tracking-tighter">GESTIÓN DE PORTAFOLIO</h1>
        <Link href="/admin/portfolio/new" className="bg-black text-white px-8 py-3 font-bold uppercase tracking-widest text-sm brutalist-border hover:bg-white hover:text-black transition-colors whitespace-nowrap brutalist-shadow-hover">
          NUEVO PROYECTO +
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <input 
          type="text" 
          placeholder="Buscar proyecto..." 
          className="flex-grow p-3 brutalist-border focus:outline-none focus:ring-2 focus:ring-black"
        />
        <select className="p-3 brutalist-border font-bold uppercase text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white appearance-none cursor-pointer">
          <option>Categoría: Todas</option>
          <option>Bodas</option>
          <option>Pre-boda</option>
          <option>Detalles</option>
          <option>Recepción</option>
        </select>
        <select className="p-3 brutalist-border font-bold uppercase text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white appearance-none cursor-pointer">
          <option>Estado: Todos</option>
          <option>Publicado</option>
          <option>Borrador</option>
        </select>
      </div>

      {/* Table Section */}
      <div className="bg-white border-4 border-black overflow-x-auto brutalist-shadow">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b-4 border-black bg-gray-100">
              <th className="p-4 w-16"></th>
              <th className="p-4 font-bold uppercase text-xs tracking-widest">Título</th>
              <th className="p-4 font-bold uppercase text-xs tracking-widest">Pareja</th>
              <th className="p-4 font-bold uppercase text-xs tracking-widest">Ubicación</th>
              <th className="p-4 font-bold uppercase text-xs tracking-widest">Categoría</th>
              <th className="p-4 font-bold uppercase text-xs tracking-widest">Fecha Evento</th>
              <th className="p-4 font-bold uppercase text-xs tracking-widest text-center">Estado</th>
              <th className="p-4 font-bold uppercase text-xs tracking-widest text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-b-2 border-gray-200 hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="w-12 h-12 bg-gray-300 border-2 border-black overflow-hidden relative">
                    {project.cover_image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={project.cover_image_url} alt="cover" className="object-cover w-full h-full grayscale" />
                    )}
                  </div>
                </td>
                <td className="p-4 font-bold">{project.title}</td>
                <td className="p-4 font-bold">{project.couple_name}</td>
                <td className="p-4 text-sm font-medium">{project.location ?? '-'}</td>
                <td className="p-4 text-sm text-gray-600">{project.category ?? '-'}</td>
                <td className="p-4 text-sm text-gray-500">{project.event_date ? new Date(project.event_date).toLocaleDateString() : '-'}</td>
                <td className="p-4 text-center">
                   <span className={`inline-block px-3 py-1 text-xs font-bold uppercase border-2 border-black ${
                        project.status === 'published' ? 'bg-black text-white' : 'bg-gray-200 text-black'
                      }`}>
                     {project.status === 'published' ? 'Publicado' : 'Borrador'}
                   </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <Link href={`/admin/portfolio/${project.id}`} className="px-3 py-1 font-bold uppercase text-xs tracking-widest brutalist-border hover:bg-black hover:text-white transition-colors">Editar</Link>
                  <DeleteProjectButton id={project.id} />
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
                <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500 font-medium tracking-widest uppercase text-sm">
                        No hay proyectos registrados en el portafolio.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Placeholder */}
      <div className="flex justify-end gap-4 pb-12">
         <button className="px-6 py-2 font-bold uppercase text-xs tracking-widest brutalist-border bg-white hover:bg-black hover:text-white transition-colors disabled:opacity-50" disabled>ANTERIOR</button>
         <button className="px-6 py-2 font-bold uppercase text-xs tracking-widest brutalist-border bg-white hover:bg-black hover:text-white transition-colors disabled:opacity-50" disabled>SIGUIENTE</button>
      </div>
    </div>
  );
}
