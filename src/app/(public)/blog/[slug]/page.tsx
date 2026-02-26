import { Navbar } from "@/ui/layouts/Navbar";
import { Footer } from "@/ui/layouts/Footer";
import { getBlogPostBySlug } from "@/core/services/blogService";
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Genera la metadata SSR dinámica extraida de la base de datos para SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
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

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = await getBlogPostBySlug(resolvedParams.slug);

  if (!post || post.status !== 'published') {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col pt-20 bg-white">
      <Navbar />
      <main className="flex-grow">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          
          <Link href="/blog" className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm text-gray-500 hover:text-black transition-colors mb-12">
            <ArrowLeft size={16} /> Volver al Blog
          </Link>

          {/* Header */}
          <header className="mb-16">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {post.category && (
                <span className="bg-black text-white px-3 py-1 text-xs font-black uppercase tracking-widest">
                  {post.category}
                </span>
              )}
              <time className="text-sm font-bold text-gray-500 tracking-wider">
                {new Date(post.created_at).toLocaleDateString('es-MX', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}
              </time>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-tight mb-8">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-xl md:text-2xl font-medium text-gray-600 border-l-8 border-black pl-6 italic">
                {post.excerpt}
              </p>
            )}
          </header>

          {/* Cover Image */}
          {post.cover_image_url && (
            <div className="w-full aspect-video border-4 border-black mb-16 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={post.cover_image_url} 
                alt={`Imagen principal de ${post.title}`}
                className="w-full h-full object-cover grayscale"
              />
            </div>
          )}

          {/* Rich Text Content */}
          {post.content ? (
            <div 
              className="prose prose-lg md:prose-xl max-w-none tiptap-brutalist"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          ) : (
            <div className="py-20 text-center border-4 border-black bg-gray-50">
               <p className="font-bold uppercase tracking-widest text-gray-600">El contenido de este artículo está vacío.</p>
            </div>
          )}

        </article>
      </main>

      {/* Global TiTap Brutalist Styles for Readers */}
      <style dangerouslySetInnerHTML={{__html: `
        .tiptap-brutalist > * + * { margin-top: 1.5em; }
        .tiptap-brutalist h1 { font-size: 2.5rem; font-weight: 900; text-transform: uppercase; letter-spacing: -0.05em; border-bottom: 4px solid black; padding-bottom: 0.5rem; margin-top: 2rem; color: black; }
        .tiptap-brutalist h2 { font-size: 1.8rem; font-weight: 800; text-transform: uppercase; margin-top: 1.5rem; color: black; }
        .tiptap-brutalist p { font-size: 1.25rem; line-height: 1.7; color: #1a1a1a; font-family: ui-sans-serif, system-ui, sans-serif; }
        .tiptap-brutalist blockquote { border-left: 8px solid black; padding-left: 1rem; font-style: italic; font-size: 1.5rem; margin: 2rem 0; background-color: #f3f4f6; padding: 1.5rem; color: black; }
        .tiptap-brutalist ul { list-style-type: square; padding-left: 1.5rem; font-size: 1.25rem; color: black; }
        .tiptap-brutalist ol { list-style-type: decimal; font-weight: bold; padding-left: 1.5rem; font-size: 1.25rem; color: black; }
        .tiptap-brutalist img { max-width: 100%; height: auto; display: block; margin: 3rem auto; border: 4px solid black; filter: grayscale(100%); }
        .tiptap-brutalist a { color: black; text-decoration: underline; font-weight: bold; }
        .tiptap-brutalist a:hover { background-color: black; color: white; }
      `}} />

      <Footer />
    </div>
  );
}
