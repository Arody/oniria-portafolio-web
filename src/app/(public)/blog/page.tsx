import { Navbar } from "@/ui/layouts/Navbar";
import { Footer } from "@/ui/layouts/Footer";
import { getPublishedBlogPosts } from "@/core/services/blogService";
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog de Bodas | Oniria',
  description: 'Inspiración, consejos y tendencias sobre fotografía y planeación de bodas para que tu gran día sea inolvidable.',
  openGraph: {
    title: 'Blog de Bodas | Oniria',
    description: 'Inspiración, consejos y tendencias sobre fotografía y planeación de bodas para que tu gran día sea inolvidable.',
    type: 'website',
  }
};

export default async function PublicBlogPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <div className="min-h-screen flex flex-col bg-obsidian">
      <Navbar />
      <main className="flex-grow pt-32">
        <section className="py-24 min-h-[50vh]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            
            {/* Header */}
            <div className="mb-20 text-center">
              <div className="w-12 h-px bg-champagne mx-auto mb-8" />
              <h1 className="text-5xl md:text-7xl font-serif font-light uppercase tracking-[0.08em] text-ivory mb-6">
                Nuestro Blog
              </h1>
              <p className="text-base md:text-lg font-sans text-mist/50 max-w-2xl mx-auto">
                Léenos y descubre cómo hacer de tu boda un evento épico.
              </p>
            </div>

            {/* Blog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {posts.length > 0 ? posts.map((post, index) => (
                <div
                  key={post.id}
                  className="bg-charcoal border border-graphite flex flex-col hover:border-champagne/30 transition-all duration-500 animate-fade-up group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-full h-64 border-b border-graphite overflow-hidden relative">
                    {post.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={post.cover_image_url} 
                        alt={post.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                        <div className="w-full h-full bg-graphite flex items-center justify-center">
                          <span className="font-sans uppercase text-mist/20 tracking-[0.2em] text-[10px]">Sin Portada</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-8 flex flex-col flex-grow">
                    {post.category && (
                      <span className="text-[10px] font-sans uppercase tracking-[0.25em] mb-4 inline-block text-champagne select-none self-start">
                        {post.category}
                      </span>
                    )}
                    <h3 className="text-xl font-serif font-light text-ivory mb-4 leading-tight shrink-0">
                      {post.title}
                    </h3>
                    <p className="text-sm text-mist/40 font-sans mb-8 flex-grow leading-relaxed">
                      {post.excerpt || 'Sin extracto disponible...'}
                    </p>
                    
                    <div className="flex justify-between items-end mt-auto pt-4 border-t border-graphite/50">
                      <span className="text-[10px] font-sans text-mist/30 tracking-[0.15em]">
                        {new Date(post.created_at).toLocaleDateString('es-MX', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}
                      </span>
                      <Link 
                        href={`/blog/${post.slug}`} 
                        className="text-[10px] font-sans text-champagne uppercase tracking-[0.2em] hover:text-ivory transition-colors duration-300"
                      >
                        Leer más →
                      </Link>
                    </div>
                  </div>
                </div>
              )) : (
                  <div className="col-span-1 md:col-span-2 lg:col-span-3 py-20 text-center text-mist/30 font-sans tracking-[0.15em] border border-dashed border-graphite uppercase text-sm">
                  Próximamente publicaremos artículos increíbles aquí.
                </div>
              )}
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
