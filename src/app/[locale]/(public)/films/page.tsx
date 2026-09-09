import { pageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import type { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionaries';
import { getPublishedProjects } from '@/core/services/portfolioService';
import { Navbar } from '@/ui/layouts/Navbar';
import { Footer } from '@/ui/layouts/Footer';
import { PortfolioSection } from '@/ui/views/PortfolioSection';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const [dict, projects] = await Promise.all([getDictionary(locale), getPublishedProjects(locale)]);
  return pageMetadata({ locale, path: '/films', title: `${dict.portfolio.title} | ONIRIA`, description: dict.portfolio.description, image: projects.find(project => project.cover_image_url)?.cover_image_url });
}

export default async function FilmsPage({ params }: Props) {
  const { locale } = await params;
  const [dict, projects] = await Promise.all([getDictionary(locale), getPublishedProjects(locale)]);

  return (
    <div className="min-h-screen flex flex-col bg-obsidian">
      <Navbar dict={dict.navigation} locale={locale} />
      <main className="flex-grow pt-24">
        <PortfolioSection projects={projects} dict={dict.portfolio} locale={locale} />
      </main>
      <Footer dict={dict.footer} navDict={dict.navigation} locale={locale} />
    </div>
  );
}
