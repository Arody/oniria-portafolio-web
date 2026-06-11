import { Navbar } from "@/ui/layouts/Navbar";
import { Footer } from "@/ui/layouts/Footer";
import { getBlogPostBySlug } from "@/core/services/blogService";
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Locale } from '@/i18n.config';

import { getDictionary } from "@/lib/dictionaries";

// Genera la metadata SSR dinámica extraida de la base de datos para SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string, locale: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getBlogPostBySlug(resolvedParams.slug);

  if (!post || post.status !== 'published') {
    return { title: 'Artículo no encontrado | Oniria' };
  }

  return {
    title: `${post.title} | Oniria Blog`,
    description: post.excerpt || `Lee sobre ${post.title} en el blog de bodas de Oniria.`,
    openGraph: {
      title: post.title,
      description: post.excerpt || `Lee sobre ${post.title} en el blog de bodas de Oniria.`,
      images: post.cover_image_url ? [post.cover_image_url] : [],
      type: 'article',
      publishedTime: post.created_at,
      authors: ['Oniria Studio'],
    }
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string, locale: string }> }) {
  const resolvedParams = await params;
  const post = await getBlogPostBySlug(resolvedParams.slug);
  const dict = await getDictionary(resolvedParams.locale as Locale);

  if (!post || post.status !== 'published') {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-obsidian">
      <Navbar dict={dict.navigation} locale={resolvedParams.locale as any} />
      <main className="flex-grow pt-32">
        <article className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-16 md:py-24">
          
          <Link href={`/${resolvedParams.locale}/blog`} className="inline-flex items-center gap-2 font-sans uppercase tracking-[0.2em] text-[10px] text-mist/40 hover:text-champagne transition-colors duration-300 mb-12">
            <ArrowLeft size={14} /> {resolvedParams.locale === 'es' ? 'Volver al Blog' : 'Back to Blog'}
          </Link>

          {/* Header */}
          <header className="mb-16 animate-blur-up">
            <div className="flex flex-wrap items-center gap-4 mb-8">
              {post.category && (
                <span className="text-[10px] font-sans text-champagne uppercase tracking-[0.25em]">
                  {post.category}
                </span>
              )}
              <time className="text-[10px] font-sans text-mist/30 tracking-[0.15em]">
                {new Date(post.created_at).toLocaleDateString(resolvedParams.locale === 'es' ? 'es-MX' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}
              </time>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-serif font-light uppercase tracking-[0.05em] leading-tight text-ivory mb-8">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-lg md:text-xl font-sans text-mist/50 border-l-2 border-champagne pl-6 italic">
                {post.excerpt}
              </p>
            )}
          </header>

          {/* Cover Image */}
          {post.cover_image_url && (
            <div className="w-full aspect-video border border-graphite mb-16 relative overflow-hidden animate-scale-reveal animation-delay-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={post.cover_image_url} 
                alt={`Imagen principal de ${post.title}`}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Rich Text Content */}
          {post.content ? (
            <div 
              className="prose prose-invert prose-lg md:prose-xl max-w-none tiptap-oniria-reader animate-fade-up"
              style={{ animationDelay: '400ms' }}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          ) : (
              <div className="py-20 text-center border border-graphite bg-charcoal">
                <p className="font-sans uppercase tracking-[0.15em] text-mist/30 text-sm">El contenido de este artículo está vacío.</p>
            </div>
          )}

        </article>
      </main>

      {/* Oniria TipTap Styles for Readers */}
      <style dangerouslySetInnerHTML={{__html: `
        .tiptap-oniria-reader > * + * { margin-top: 1.5em; }
        .tiptap-oniria-reader h1 { font-size: 2rem; font-weight: 300; font-family: 'Cormorant Garamond', serif; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #2A2A2E; padding-bottom: 0.5rem; margin-top: 2rem; color: #F5F5F3; }
        .tiptap-oniria-reader h2 { font-size: 1.5rem; font-weight: 300; font-family: 'Cormorant Garamond', serif; text-transform: uppercase; letter-spacing: 0.03em; margin-top: 1.5rem; color: #F5F5F3; }
        .tiptap-oniria-reader p { font-size: 1.1rem; line-height: 1.8; color: #E8E8E6; font-family: 'Inter', sans-serif; }
        .tiptap-oniria-reader blockquote { border-left: 2px solid #C6A56E; padding-left: 1.5rem; font-style: italic; font-size: 1.15rem; margin: 2rem 0; background-color: rgba(42, 42, 46, 0.3); padding: 1.5rem; color: #E8E8E6; }
        .tiptap-oniria-reader ul { list-style-type: disc; padding-left: 1.5rem; font-size: 1.1rem; color: #E8E8E6; }
        .tiptap-oniria-reader ol { list-style-type: decimal; padding-left: 1.5rem; font-size: 1.1rem; color: #E8E8E6; }
        .tiptap-oniria-reader img { max-width: 100%; height: auto; display: block; margin: 3rem auto; border: 1px solid #2A2A2E; }
        .tiptap-oniria-reader a { color: #C6A56E; text-decoration: none; border-bottom: 1px solid rgba(198, 165, 110, 0.3); }
        .tiptap-oniria-reader a:hover { border-bottom-color: #C6A56E; }
      `}} />

      <Footer dict={dict.footer} navDict={dict.navigation} locale={resolvedParams.locale as any} />
    </div>
  );
}
