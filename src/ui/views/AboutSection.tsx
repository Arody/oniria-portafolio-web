import Link from 'next/link';
import type { GlobalSettings } from '@/core/services/settingsService';
import { getAboutContent } from '@/core/utils/aboutContent';
import { AboutMedia } from '@/ui/components/AboutMedia';
import type { Locale } from '@/i18n.config';
import type { Dictionary } from '@/lib/dictionaries';
import { ScrollReveal } from '@/ui/components/ScrollReveal';

export function AboutSection({ dict, locale, settings, fullPage = false }: {
  dict: Dictionary['about'];
  locale: Locale;
  settings: GlobalSettings;
  fullPage?: boolean;
}) {
  const content = getAboutContent(settings, dict);
  const Heading = fullPage ? 'h1' : 'h2';
  return (
    <section id="about" className="bg-ivory text-obsidian py-20 md:py-28 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 items-center gap-12 lg:gap-24">
          <AboutMedia type={settings.about_media_type} imageUrl={settings.about_image_url} videoUrl={settings.about_video_url} alt={content.image_alt} />
          <ScrollReveal y={0}>
            <p className="text-xs tracking-[0.3em] font-sans mb-8">{content.label}</p>
            <Heading className="font-serif text-4xl md:text-5xl lg:text-6xl font-light leading-tight mb-8">{content.title || <span className="sr-only">About ONIRIA</span>}</Heading>
            <p className="font-serif text-xl md:text-2xl leading-relaxed mb-6">{content.intro}</p>
            <p className="whitespace-pre-line text-sm md:text-base text-obsidian/65 leading-relaxed max-w-lg">{content.body}</p>
            {!fullPage && content.more && <Link href={`/${locale}/about`} className="inline-block mt-10 pb-2 border-b border-gold-dust text-xs uppercase tracking-[0.2em] hover:text-gold-dust transition-colors">{content.more}</Link>}
          </ScrollReveal>
        </div>
        {fullPage && <>
          <div className="mt-24 md:mt-32 pt-16 border-t border-obsidian/15">
            <h2 className="font-serif font-light text-3xl md:text-4xl mb-12">{content.approach_title}</h2>
            <div className="grid md:grid-cols-3 gap-10 lg:gap-16">
              {([1, 2, 3] as const).map((number, index) => {
                const item = { title: content[`approach_${number}_title`], text: content[`approach_${number}_text`] };
                return (item.title || item.text) && <div key={number}>
                <span className="text-gold-dust text-xs tracking-widest">0{index + 1}</span>
                <h3 className="font-serif text-2xl font-light mt-5 mb-4">{item.title}</h3>
                <p className="whitespace-pre-line text-sm text-obsidian/65 leading-relaxed">{item.text}</p>
              </div>; })}
            </div>
          </div>
          <div className="mt-24 md:mt-32 pt-16 border-t border-obsidian/15 text-center">
            <h2 className="font-serif font-light text-3xl md:text-5xl mb-6">{content.closing_title}</h2>
            <p className="whitespace-pre-line text-sm text-obsidian/65 leading-relaxed">{content.closing_text}</p>
            <div className="flex flex-wrap justify-center gap-6 mt-10">
              {content.contact && <Link href={`/${locale}/contact`} className="px-8 py-4 bg-obsidian text-ivory text-xs tracking-[0.2em] uppercase hover:bg-charcoal transition-colors">{content.contact}</Link>}
              {content.films && <Link href={`/${locale}/films`} className="px-8 py-4 border border-obsidian/25 text-xs tracking-[0.2em] uppercase hover:border-obsidian transition-colors">{content.films}</Link>}
            </div>
          </div>
        </>}
      </div>
    </section>
  );
}
