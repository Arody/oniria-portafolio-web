import { Navbar } from "@/ui/layouts/Navbar";
import { Footer } from "@/ui/layouts/Footer";
import { HeroSection } from "@/ui/views/HeroSection";
import { PortfolioSection } from "@/ui/views/PortfolioSection";
import { BlogSection } from "@/ui/views/BlogSection";
import { ContactSection } from "@/ui/views/ContactSection";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col pt-20">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <PortfolioSection />
        <BlogSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
