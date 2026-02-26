import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import { getSettings } from '@/core/services/settingsService'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
})

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: settings.site_title || 'Oniria Weddings',
    description: settings.site_description || 'Fotografía y planificación de bodas que capturan cada momento único.',
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const settings = await getSettings();

  return (
    <html lang="es">
      <head>
        <style>
          {`
               :root {
                  --font-heading: ${settings.heading_font || 'Cabinet Grotesk, sans-serif'};
                  --font-body: ${settings.body_font || 'Inter, sans-serif'};
               }
               
               body {
                  font-family: var(--font-body);
               }

               h1, h2, h3, h4, h5, h6, .font-black {
                  font-family: var(--font-heading);
               }
            `}
        </style>
      </head>
      <body className={`${spaceGrotesk.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
