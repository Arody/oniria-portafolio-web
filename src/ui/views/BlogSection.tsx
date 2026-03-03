import Link from 'next/link';

import type { BlogPost } from '@/core/services/blogService';
import type { Dictionary } from '@/lib/dictionaries';
import type { Locale } from '@/i18n.config';

interface BlogSectionProps {
  posts: BlogPost[];
  dict: Dictionary['blog'];
  locale: Locale;
}

export function BlogSection({ posts, dict, locale }: BlogSectionProps) {
  // Take only the latest 3 posts for the homepage
  const recentPosts = posts.slice(0, 3);
  return (
    <section id="blog" className="py-28 bg-charcoal relative">
      {/* Subtle top border */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-champagne/30" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Header */}
        <div className="mb-20 text-center">
          <p className="text-champagne text-xs font-sans uppercase tracking-[0.3em] mb-4">
            {dict.subtitle}
          </p>
          <h2 className="text-5xl md:text-7xl font-serif font-light text-ivory uppercase tracking-[0.1em]">
            {dict.title}
          </h2>
          <div className="w-16 h-px bg-champagne/40 mx-auto mt-8" />
        </div>

        {/* Blog Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {recentPosts.length > 0 ? recentPosts.map((post, idx) => (
            <Link
              key={post.id}
              href={`/${locale}/blog/${post.slug}`}
              className="bg-graphite/50 flex flex-col group transition-all duration-500 hover:bg-graphite border border-graphite/50 hover:border-champagne/20 animate-fade-up relative overflow-hidden"
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              {/* Champagne top accent that slides in on hover */}
              <div className="absolute top-0 left-0 right-0 h-px bg-champagne scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] origin-left z-10" />

              {/* Image */}
              <div className="w-full h-64 overflow-hidden relative">
                {post.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={post.cover_image_url}
                    alt={post.title}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-75"
                  />
                ) : (
                    <div className="w-full h-full bg-graphite flex items-center justify-center">
                      <span className="font-sans uppercase text-mist/30 tracking-[0.2em] text-xs">{dict.no_cover}</span>
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="p-8 flex flex-col flex-grow">
                {post.category && (
                  <div className="flex items-center gap-3 mb-5">
                    <span className="w-4 h-px bg-champagne/60 group-hover:w-8 transition-all duration-500" />
                    <span className="font-serif italic text-champagne/80 text-sm tracking-wide">
                      {post.category}
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-serif font-light text-ivory mb-4 leading-relaxed tracking-wide group-hover:text-champagne transition-colors duration-400">
                  {post.title}
                </h3>
                <p className="text-mist/60 text-sm font-sans leading-relaxed mb-8 flex-grow">
                  {post.excerpt || 'Sin extracto disponible...'}
                </p>
                
                <div className="flex justify-between items-end mt-auto pt-4 border-t border-graphite">
                  <span className="text-[10px] font-sans text-mist/40 tracking-[0.15em] uppercase">
                    {new Date(post.created_at).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}
                  </span>
                  <span className="text-champagne font-sans uppercase text-xs tracking-[0.2em] group-hover:text-ivory transition-colors duration-400">
                    {dict.read_more}
                  </span>
                </div>
              </div>
            </Link>
          )) : (
              <div className="col-span-3 py-16 text-center border border-graphite">
                <p className="font-sans text-mist/40 uppercase tracking-[0.2em] text-sm">{dict.empty}</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link 
            href={`/${locale}/blog`}
            className="inline-block bg-transparent text-ivory px-10 py-4 font-sans uppercase tracking-[0.3em] text-xs border border-ivory/30 hover:border-champagne hover:text-champagne transition-all duration-500"
          >
            {dict.view_all}
          </Link>
        </div>

      </div>
    </section>
  );
}
