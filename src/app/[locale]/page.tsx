import { Navbar } from "@/ui/layouts/Navbar";
import { Footer } from "@/ui/layouts/Footer";
import { HeroSection } from "@/ui/views/HeroSection";
import { PortfolioSection } from "@/ui/views/PortfolioSection";
import { EditorialCollage } from "@/ui/views/EditorialCollage";
import { EditorialInterlude } from "@/ui/views/EditorialInterlude";
import { SplashScreen } from "@/ui/components/SplashScreen";
import { HeroPhilosophy } from "@/ui/views/HeroPhilosophy";

import { getPublishedProjects } from "@/core/services/portfolioService";
import { getSettings } from "@/core/services/settingsService";
import { getDictionary } from "@/lib/dictionaries";
import { Locale } from "@/i18n.config";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = {
  params: Promise<{ locale: Locale }>;
}

export default async function Home({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  
  const [projects, settings] = await Promise.all([
    getPublishedProjects(),
    getSettings(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-obsidian">
      <SplashScreen
        logoImageUrl={settings.logo_image_url}
        logoText={settings.logo_text || 'ONIRIA.'}
        headingFont={settings.heading_font}
      />
      <Navbar dict={dict.navigation} locale={locale} />
      <main className="flex-grow">
        {settings.hero_text_enabled !== false && settings.philosophy_enabled !== false ? (
          <HeroPhilosophy
            phrases={[
              settings.philosophy_phrase_1 || dict.hero.philosophy[0],
              settings.philosophy_phrase_2 || dict.hero.philosophy[1],
              settings.philosophy_phrase_3 || dict.hero.philosophy[2],
            ].filter(Boolean)}
          >
            <HeroSection />
          </HeroPhilosophy>
        ) : (
          <HeroSection />
        )}

        <EditorialCollage settings={settings} dict={dict.editorial_collage} />

        {/* Interlude 1 — Between Hero and Portfolio */}
        {settings.interlude_1_enabled !== false && (
          <EditorialInterlude
            quote={settings.interlude_1_quote || dict.interludes['1_quote']}
            subtitle={settings.interlude_1_subtitle ?? dict.interludes['1_signature']}
            mediaUrl={settings.interlude_1_media_url || "/interludes/hands.png"}
            mediaType={settings.interlude_1_media_type || "image"}
            textSide="left"
            accentWord={settings.interlude_1_accent || dict.interludes['1_accent']}
          />
        )}

        <PortfolioSection projects={projects.slice(0, 6)} dict={dict.portfolio} filmsHref={`/${locale}/films`} />

        {/* Interlude 2 — Between Portfolio and Footer */}
        {settings.interlude_2_enabled !== false && (
          <EditorialInterlude
            quote={settings.interlude_2_quote || dict.interludes['2_quote']}
            subtitle={settings.interlude_2_subtitle ?? dict.interludes['2_signature']}
            mediaUrl={settings.interlude_2_media_url || "/interludes/veil.png"}
            mediaType={settings.interlude_2_media_type || "image"}
            textSide="right"
            accentWord={settings.interlude_2_accent || dict.interludes['2_accent']}
          />
        )}

      </main>
      <Footer dict={dict.footer} navDict={dict.navigation} locale={locale} />
    </div>
  );
}
