import type { Metadata, ResolvingMetadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import { getSettings } from '@/core/services/settingsService'
import '../globals.css'
import { i18n, type Locale } from '@/i18n.config'

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

type Props = {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { locale } = await params;
  const settings = await getSettings();
  
  return {
    title: settings.site_title || 'Oniria Weddings',
    description: settings.site_description || 'Fotografía y planificación de bodas que capturan cada momento único.',
    alternates: {
      languages: {
        'es': '/es',
        'en': '/en',
        'x-default': '/es',
      },
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Props) {
  const settings = await getSettings();
  const { locale } = await params;

  return (
    <html lang={locale} className="dark">
      <head>
        <style>
          {`
               :root {
                  --font-heading: ${settings.heading_font || 'Cormorant Garamond, serif'};
                  --font-body: ${settings.body_font || 'Inter, sans-serif'};
               }
               
               body {
                  font-family: var(--font-body);
               }

               h1, h2, h3, h4, h5, h6, .font-heading {
                  font-family: var(--font-heading);
               }
            `}
        </style>
      </head>
      <body className={`${cormorant.variable} ${inter.variable} antialiased bg-obsidian text-ivory`}>
        {children}
      </body>
    </html>
  )
}
