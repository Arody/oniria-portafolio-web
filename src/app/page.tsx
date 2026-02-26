import { Navbar } from "@/ui/layouts/Navbar";
import { Footer } from "@/ui/layouts/Footer";
import { HeroSection } from "@/ui/views/HeroSection";
import { PortfolioSection } from "@/ui/views/PortfolioSection";
import { BlogSection } from "@/ui/views/BlogSection";
import { ContactSection } from "@/ui/views/ContactSection";
import { LogoutButton } from "@/ui/components/LogoutButton";

import { getPublishedProjects } from "@/core/services/portfolioService";
import { getPublishedBlogPosts } from "@/core/services/blogService";

export default async function Home() {
  const projects = await getPublishedProjects();
  const blogPosts = await getPublishedBlogPosts();

  return (
    <div className="min-h-screen flex flex-col pt-20">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <PortfolioSection projects={projects} />
        <BlogSection posts={blogPosts} />
        <ContactSection />
        <LogoutButton />
      </main>
      <Footer />
    </div>
  );
}
