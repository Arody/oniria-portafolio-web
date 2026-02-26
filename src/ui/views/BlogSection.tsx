import Link from 'next/link';

const MOCK_POSTS = [
  {
    id: 1,
    category: "INSPIRACIÓN",
    title: "10 Tendencias de Bodas para 2025",
    excerpt: "Descubre las paletas de colores y estilos minimalistas que dominarán esta temporada.",
    date: "15 ENERO, 2025",
    img: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: 2,
    category: "CONSEJOS",
    title: "Cómo Elegir tu Fotógrafo de Bodas",
    excerpt: "Guía práctica para encontrar el estilo editorial que mejor cuente tu historia.",
    date: "10 ENERO, 2025",
    img: "https://images.unsplash.com/photo-1542037104857-ffcb0b07802b?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: 3,
    category: "TENDENCIAS",
    title: "Guía Completa de Decoración Minimalista",
    excerpt: "Menos es más. Cómo lograr una estética impactante con elementos cuidadosamente seleccionados.",
    date: "05 ENERO, 2025",
    img: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=600"
  }
];

export function BlogSection() {
  return (
    <section id="blog" className="py-24 bg-gray-50 border-b-4 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4 text-black">
            BLOG
          </h2>
          <p className="text-xl md:text-2xl font-medium text-gray-600">
            Inspiración y consejos para tu gran día
          </p>
        </div>

        {/* Blog Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {MOCK_POSTS.map((post) => (
            <div key={post.id} className="bg-white brutalist-border flex flex-col brutalist-shadow-hover transition-transform duration-300">
              {/* Image */}
              <div className="w-full h-64 border-b-2 border-black overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={post.img} 
                  alt={post.title} 
                  className="w-full h-full object-cover grayscale hover:scale-105 transition-transform duration-700"
                />
              </div>
              
              {/* Content */}
              <div className="p-8 flex flex-col flex-grow">
                <span className="text-xs font-black uppercase tracking-widest mb-4 inline-block bg-black text-white px-2 py-1 select-none">
                  {post.category}
                </span>
                <h3 className="text-2xl font-bold mb-4 leading-tight shrink-0">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-8 flex-grow">
                  {post.excerpt}
                </p>
                
                <div className="flex justify-between items-end mt-auto pt-4 border-t-2 border-dashed border-gray-300">
                  <span className="text-xs font-bold text-gray-500 tracking-wider">
                    {post.date}
                  </span>
                  <Link 
                    href={`/blog/${post.id}`} 
                    className="text-black font-black uppercase text-sm tracking-widest border-b-4 border-black hover:text-gray-600 hover:border-gray-600 transition-colors"
                  >
                    LEER MÁS →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link 
            href="/blog" 
            className="inline-block bg-white text-black px-10 py-5 font-bold uppercase tracking-widest brutalist-border-thick brutalist-shadow-hover"
          >
            VER TODOS LOS ARTÍCULOS
          </Link>
        </div>

      </div>
    </section>
  );
}
