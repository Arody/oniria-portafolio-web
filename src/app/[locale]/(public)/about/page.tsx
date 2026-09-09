import type { Metadata } from 'next';
import type { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionaries';
import { getAboutContent } from '@/core/utils/aboutContent';
import { getSettings } from '@/core/services/settingsService';
import { Navbar } from '@/ui/layouts/Navbar';
import { Footer } from '@/ui/layouts/Footer';
import { AboutSection } from '@/ui/views/AboutSection';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const [dict, settings] = await Promise.all([getDictionary(locale), getSettings()]);
  return { title: 'About | ONIRIA', description: getAboutContent(settings, dict.about).intro };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const [dict, settings] = await Promise.all([getDictionary(locale), getSettings()]);
  return (
    <div className="min-h-screen flex flex-col bg-obsidian">
      <Navbar dict={dict.navigation} locale={locale} />
      <main className="flex-grow pt-24">
        <AboutSection dict={dict.about} locale={locale} settings={settings} fullPage />
      </main>
      <Footer dict={dict.footer} navDict={dict.navigation} locale={locale} />
    </div>
  );
}
