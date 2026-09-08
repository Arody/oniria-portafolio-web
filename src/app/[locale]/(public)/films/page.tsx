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
  const dict = await getDictionary(locale);
  return { title: `${dict.portfolio.title} | ONIRIA`, description: dict.portfolio.subtitle };
}

export default async function FilmsPage({ params }: Props) {
  const { locale } = await params;
  const [dict, projects] = await Promise.all([getDictionary(locale), getPublishedProjects()]);

  return (
    <div className="min-h-screen flex flex-col bg-obsidian">
      <Navbar dict={dict.navigation} locale={locale} />
      <main className="flex-grow pt-24">
        <PortfolioSection projects={projects} dict={dict.portfolio} />
      </main>
      <Footer dict={dict.footer} navDict={dict.navigation} locale={locale} />
    </div>
  );
}
