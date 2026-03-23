import type { Metadata, ResolvingMetadata } from 'next'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'
import { getSettings } from '@/core/services/settingsService'
import '../globals.css'
import { i18n, type Locale } from '@/i18n.config'

const ttTsars = localFont({
  src: [
    {
      path: '../../../public/tt_tsars/TT Tsars A Trial Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../../public/tt_tsars/TT Tsars A Trial Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../../public/tt_tsars/TT Tsars A Trial Bold.otf',
      weight: '700',
      style: 'normal',
    }
  ],
  variable: '--font-tsars',
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
                  --font-heading: ${settings.heading_font || 'var(--font-tsars), serif'};
                  --font-body: ${settings.body_font || 'var(--font-inter), sans-serif'};
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
      <body className={`${ttTsars.variable} ${inter.variable} antialiased bg-obsidian text-ivory`}>
        {children}
      </body>
    </html>
  )
}
