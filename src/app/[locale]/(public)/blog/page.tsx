import { pageMetadata } from '@/lib/metadata';
import { Navbar } from "@/ui/layouts/Navbar";
import { Footer } from "@/ui/layouts/Footer";
import { ScrollReveal } from "@/ui/components/ScrollReveal";
import { getPublishedBlogPosts } from "@/core/services/blogService";
import Link from 'next/link';
import { Metadata } from 'next';
import type { Locale } from '@/i18n.config';

import { getDictionary } from "@/lib/dictionaries";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const posts = await getPublishedBlogPosts(locale);
  return pageMetadata({ locale, path: '/blog', title: `${dict.blog.title} | ONIRIA`, description: dict.blog.subtitle, image: posts.find(post => post.cover_image_url)?.cover_image_url || '/interludes/toast.png' });
}

export default async function PublicBlogPage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const posts = await getPublishedBlogPosts(locale);

  return (
    <div className="min-h-screen flex flex-col bg-obsidian">
      <Navbar dict={dict.navigation} locale={locale as Locale} />
      <main className="flex-grow pt-32">
        <section className="py-24 min-h-[50vh]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            
            {/* Header */}
            <div className="mb-20 text-center">
              <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-champagne block mb-4 animate-fade-up">
                {dict.blog.subtitle || 'Historias & Inspiración'}
              </span>
              <h1 className="text-5xl md:text-7xl font-serif font-light uppercase tracking-[0.08em] text-ivory mb-6 animate-blur-up animation-delay-200">
                {dict.blog.title || 'Blog'}
              </h1>
              <div className="w-12 h-px bg-champagne mx-auto mb-6 origin-center animate-line-grow" />
              <p className="text-base md:text-lg font-sans text-mist/50 max-w-2xl mx-auto animate-fade-up animation-delay-400 font-light">
                {locale === 'en'
                  ? 'Stories, wedding inspiration, and perspectives behind the lens.'
                  : 'Historias, inspiración nupcial y perspectivas detrás de nuestro lente.'}
              </p>
            </div>

            {/* Blog Grid */}
            <ScrollReveal stagger={0.1} y={48} start="top 90%" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {posts.length > 0 ? posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-charcoal border border-graphite flex flex-col hover:border-champagne/30 transition-colors duration-500 group"
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
                          <span className="font-sans uppercase text-mist/20 tracking-[0.2em] text-[10px]">
                            {dict.blog.no_cover || 'Sin Portada'}
                          </span>
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
                        {new Date(post.created_at).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}
                      </span>
                      <Link 
                        href={`/${locale}/blog/${post.slug}`} 
                        className="text-[10px] font-sans text-champagne uppercase tracking-[0.2em] hover:text-ivory transition-colors duration-300"
                      >
                        {dict.blog.read_more}
                      </Link>
                    </div>
                  </div>
                </div>
              )) : (
                  <div className="col-span-1 md:col-span-2 lg:col-span-3 py-20 text-center text-mist/30 font-sans tracking-[0.15em] border border-dashed border-graphite uppercase text-sm">
                  {dict.blog.empty || 'Próximamente publicaremos artículos increíbles aquí.'}
                </div>
              )}
            </ScrollReveal>

          </div>
        </section>
      </main>
      <Footer dict={dict.footer} navDict={dict.navigation} locale={locale as Locale} />
    </div>
  );
}
