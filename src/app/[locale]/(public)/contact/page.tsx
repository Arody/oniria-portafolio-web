import type { Metadata } from 'next';
import type { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionaries';
import { Navbar } from '@/ui/layouts/Navbar';
import { Footer } from '@/ui/layouts/Footer';
import { ContactSection } from '@/ui/views/ContactSection';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata(): Promise<Metadata> {
  const { contact } = await getDictionary('en');
  return { title: `${contact.title} | ONIRIA`, description: contact.description };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary('en');

  return (
    <div lang="en" className="min-h-screen flex flex-col bg-obsidian">
      <Navbar dict={dict.navigation} locale={locale} />
      <main className="flex-grow pt-24">
        <ContactSection dict={dict.contact} />
      </main>
      <Footer dict={dict.footer} navDict={dict.navigation} locale={locale} />
    </div>
  );
}
