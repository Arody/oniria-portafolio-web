import Link from 'next/link';

import type { BlogPost } from '@/core/services/blogService';

interface BlogSectionProps {
  posts: BlogPost[];
}

export function BlogSection({ posts }: BlogSectionProps) {
  // Take only the latest 3 posts for the homepage
  const recentPosts = posts.slice(0, 3);
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
          {recentPosts.length > 0 ? recentPosts.map((post) => (
            <div key={post.id} className="bg-white brutalist-border flex flex-col brutalist-shadow-hover transition-transform duration-300">
              {/* Image */}
              <div className="w-full h-64 border-b-2 border-black overflow-hidden relative">
                {post.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={post.cover_image_url}
                    alt={post.title}
                    className="w-full h-full object-cover grayscale hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="font-bold uppercase text-gray-500 tracking-widest text-sm">Sin Portada</span>
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="p-8 flex flex-col flex-grow">
                {post.category && (
                  <span className="text-xs font-black uppercase tracking-widest mb-4 inline-block bg-black text-white px-2 py-1 select-none self-start">
                    {post.category}
                  </span>
                )}
                <h3 className="text-2xl font-bold mb-4 leading-tight shrink-0">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-8 flex-grow">
                  {post.excerpt || 'Sin extracto disponible...'}
                </p>
                
                <div className="flex justify-between items-end mt-auto pt-4 border-t-2 border-dashed border-gray-300">
                  <span className="text-xs font-bold text-gray-500 tracking-wider">
                    {new Date(post.created_at).toLocaleDateString('es-MX', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}
                  </span>
                  <Link 
                    href={`/blog/${post.slug}`} 
                    className="text-black font-black uppercase text-sm tracking-widest border-b-4 border-black hover:text-gray-600 hover:border-gray-600 transition-colors"
                  >
                    LEER MÁS →
                  </Link>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-3 py-12 text-center text-gray-500 font-bold tracking-widest border-4 border-dashed border-gray-300 uppercase">
              No hay artículos publicados aún.
            </div>
          )}
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
