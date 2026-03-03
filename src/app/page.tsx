import { Navbar } from "@/ui/layouts/Navbar";
import { Footer } from "@/ui/layouts/Footer";
import { HeroSection } from "@/ui/views/HeroSection";
import { PortfolioSection } from "@/ui/views/PortfolioSection";
import { BlogSection } from "@/ui/views/BlogSection";
import { ContactSection } from "@/ui/views/ContactSection";
import { EditorialInterlude } from "@/ui/views/EditorialInterlude";
import { LogoutButton } from "@/ui/components/LogoutButton";

import { getPublishedProjects } from "@/core/services/portfolioService";
import { getPublishedBlogPosts } from "@/core/services/blogService";

export default async function Home() {
  const projects = await getPublishedProjects();
  const blogPosts = await getPublishedBlogPosts();

  return (
    <div className="min-h-screen flex flex-col bg-obsidian">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />

        {/* Interlude 1 — Between Hero and Portfolio */}
        <EditorialInterlude
          quote="Cada historia de amor merece ser contada con la delicadeza de un susurro y la fuerza de lo eterno."
          subtitle="— Filosofía Oniria"
          mediaUrl="/interludes/hands.png"
          mediaType="image"
          textSide="left"
          accentWord="eterno"
        />

        <PortfolioSection projects={projects} />

        {/* Interlude 2 — Between Portfolio and Blog */}
        <EditorialInterlude
          quote="No capturamos momentos. Creamos fragmentos de eternidad que respirarán por siempre."
          subtitle="— El Arte de Recordar"
          mediaUrl="/interludes/veil.png"
          mediaType="image"
          textSide="right"
          accentWord="eternidad"
        />

        <BlogSection posts={blogPosts} />

        {/* Interlude 3 — Between Blog and Contact */}
        <EditorialInterlude
          quote="Tu historia merece más que una fotografía. Merece un poema visual que trascienda el tiempo."
          subtitle="— Creemos en lo Inolvidable"
          mediaUrl="/interludes/toast.png"
          mediaType="image"
          textSide="left"
          accentWord="poema visual"
        />

        <ContactSection />
        <LogoutButton />
      </main>
      <Footer />
    </div>
  );
}
