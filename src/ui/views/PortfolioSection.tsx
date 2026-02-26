import Image from 'next/image';
import Link from 'next/link';

// Mock data to match the design reference
const MOCK_PROJECTS = [
  { id: 1, couple: "MARÍA & CARLOS", location: "CANCÚN", category: "Bodas", img: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800", height: "h-96" },
  { id: 2, couple: "ANA & PEDRO", location: "CDMX", category: "Pre-boda", img: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800", height: "h-64" },
  { id: 3, couple: "LAURA & DIEGO", location: "MÉRIDA", category: "Bodas", img: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=800", height: "h-80" },
  { id: 4, couple: "SOFÍA & ANDRÉS", location: "TULUM", category: "Detalles", img: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=800", height: "h-64" },
  { id: 5, couple: "CARMEN & LUIS", location: "OAXACA", category: "Recepción", img: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800", height: "h-96" },
  { id: 6, couple: "VALERIA & HUGO", location: "MONTERREY", category: "Bodas", img: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=800", height: "h-80" },
];

export function PortfolioSection() {
  return (
    <section id="portafolio" className="py-24 bg-white border-b-4 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-16">
          <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-2 inline-block border-b-4 border-black pb-2">
            PORTAFOLIO
          </h2>
          <p className="text-xl md:text-2xl font-medium text-gray-600 mt-4">
            Nuestro trabajo habla por sí mismo
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-4 mb-12">
          {['Todas', 'Bodas', 'Pre-boda', 'Detalles', 'Recepción'].map((filter, index) => (
            <button 
              key={filter}
              className={`px-6 py-2 uppercase text-sm font-bold brutalist-border transition-colors ${index === 0 ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {MOCK_PROJECTS.map((project) => (
            <div key={project.id} className="relative group overflow-hidden brutalist-border bg-gray-200 block break-inside-avoid">
              <div className={`relative w-full ${project.height}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={project.img} 
                  alt={`${project.couple} Wedding`}
                  className="w-full h-full object-cover grayscale transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-center">
                <h3 className="text-white text-2xl font-bold uppercase tracking-wider mb-2">
                  {project.couple}
                </h3>
                <p className="text-gray-300 font-medium tracking-widest text-sm">— {project.location} —</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link 
            href="/portafolio" 
            className="inline-block bg-white text-black px-10 py-5 font-bold uppercase tracking-widest brutalist-border-thick brutalist-shadow-hover"
          >
            VER MÁS PROYECTOS
          </Link>
        </div>

      </div>
    </section>
  );
}
