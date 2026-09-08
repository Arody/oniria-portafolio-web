import type { Metadata } from 'next';
import type { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionaries';
import { Navbar } from '@/ui/layouts/Navbar';
import { Footer } from '@/ui/layouts/Footer';
import { ContactSection } from '@/ui/views/ContactSection';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { contact } = await getDictionary(locale);
  return { title: `${contact.title} | ONIRIA`, description: contact.description };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div className="min-h-screen flex flex-col bg-obsidian">
      <Navbar dict={dict.navigation} locale={locale} />
      <main className="flex-grow pt-24">
        <ContactSection dict={dict.contact} />
      </main>
      <Footer dict={dict.footer} navDict={dict.navigation} locale={locale} />
    </div>
  );
}
