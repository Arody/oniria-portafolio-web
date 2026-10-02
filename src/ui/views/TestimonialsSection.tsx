import { Star } from 'lucide-react';
import type { Dictionary } from '@/lib/dictionaries';
import { testimonialPhoto, type Testimonial } from '@/core/utils/testimonials';

export function TestimonialsSection({ testimonials, dict, locale }: { testimonials: Testimonial[]; dict: Dictionary['testimonials']; locale: string }) {
  if (!testimonials.length) return null;
  return (
    <section id="testimonials" aria-labelledby="testimonials-title" className="py-24 md:py-32 px-6 md:px-12 bg-obsidian border-t border-graphite/40">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-14">
          <p className="text-champagne text-[10px] tracking-[0.3em] uppercase mb-5">{dict.eyebrow}</p>
          <h2 id="testimonials-title" className="font-serif text-3xl md:text-5xl font-light text-ivory">{dict.title}</h2>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {testimonials.map(item => {
            const photo = testimonialPhoto(item.photo_path);
            return <figure key={item.id} className="min-w-0 m-0 p-8 bg-charcoal/40 border border-graphite flex flex-col">
              <div role="img" aria-label={dict.stars.replace('{count}', String(item.rating))} className="flex gap-1 text-champagne mb-6">
                {Array.from({ length: 5 }, (_, index) => <Star key={index} aria-hidden="true" size={16} fill={index < item.rating ? 'currentColor' : 'none'} className={index < item.rating ? '' : 'text-graphite'} />)}
              </div>
              <blockquote className="font-serif text-xl leading-relaxed text-ivory/90 whitespace-pre-line break-words mb-8">
                {locale === 'en' && item.comment_en ? item.comment_en : item.comment}
              </blockquote>
              <figcaption className="flex items-center gap-4 mt-auto">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt="" loading="lazy" width={48} height={48} className="w-12 h-12 rounded-full object-cover shrink-0 border border-champagne/30" />
                ) : <span aria-hidden="true" className="w-12 h-12 rounded-full bg-graphite text-champagne flex items-center justify-center font-serif text-xl shrink-0">{item.name.slice(0, 1).toUpperCase()}</span>}
                <span className="text-xs tracking-[0.12em] uppercase text-mist break-words">{item.name}</span>
              </figcaption>
            </figure>;
          })}
        </div>
      </div>
    </section>
  );
}
