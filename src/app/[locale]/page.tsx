import { Navbar } from "@/ui/layouts/Navbar";
import { Footer } from "@/ui/layouts/Footer";
import { HeroSection } from "@/ui/views/HeroSection";
import { PortfolioSection } from "@/ui/views/PortfolioSection";
import { BlogSection } from "@/ui/views/BlogSection";
import { ContactSection } from "@/ui/views/ContactSection";
import { EditorialInterlude } from "@/ui/views/EditorialInterlude";
import { LogoutButton } from "@/ui/components/LogoutButton";
import { SplashScreen } from "@/ui/components/SplashScreen";
import { HeroPhilosophy } from "@/ui/views/HeroPhilosophy";

import { getPublishedProjects } from "@/core/services/portfolioService";
import { getPublishedBlogPosts } from "@/core/services/blogService";
import { getSettings } from "@/core/services/settingsService";
import { getDictionary } from "@/lib/dictionaries";
import { Locale } from "@/i18n.config";

type Props = {
  params: Promise<{ locale: Locale }>;
}

export default async function Home({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  
  const [projects, blogPosts, settings] = await Promise.all([
    getPublishedProjects(),
    getPublishedBlogPosts(),
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
        {settings.philosophy_enabled !== false ? (
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

        {/* Interlude 1 — Between Hero and Portfolio */}
        <EditorialInterlude
          quote={dict.interludes['1_quote']}
          subtitle={dict.interludes['1_signature']}
          mediaUrl="/interludes/hands.png"
          mediaType="image"
          textSide="left"
          accentWord={dict.interludes['1_accent']}
        />

        <PortfolioSection projects={projects} dict={dict.portfolio} />

        {/* Interlude 2 — Between Portfolio and Blog */}
        <EditorialInterlude
          quote={dict.interludes['2_quote']}
          subtitle={dict.interludes['2_signature']}
          mediaUrl="/interludes/veil.png"
          mediaType="image"
          textSide="right"
          accentWord={dict.interludes['2_accent']}
        />

        <BlogSection posts={blogPosts} dict={dict.blog} locale={locale} />

        {/* Interlude 3 — Between Blog and Contact */}
        <EditorialInterlude
          quote={dict.interludes['3_quote']}
          subtitle={dict.interludes['3_signature']}
          mediaUrl="/interludes/toast.png"
          mediaType="image"
          textSide="left"
          accentWord={dict.interludes['3_accent']}
        />

        <ContactSection dict={dict.contact} />
        <LogoutButton />
      </main>
      <Footer dict={dict.footer} navDict={dict.navigation} locale={locale} />
    </div>
  );
}
