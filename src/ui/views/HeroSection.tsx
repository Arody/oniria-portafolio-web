import Link from 'next/link';

export function HeroSection() {
  return (
    <section id="inicio" className="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center bg-zinc-900 overflow-hidden border-b-4 border-black">
      {/* Background Image Placeholder - using a generic high contrast grayscale source or solid gray for now */}
      <div 
        className="absolute inset-0 z-0 opacity-50 bg-cover bg-center grayscale"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=2560')" }}
      />
      
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-5xl mx-auto mt-20">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tighter leading-none mb-6 drop-shadow-lg brutalist-shadow">
          DONDE LOS SUEÑOS SE HACEN REALIDAD
        </h1>
        <p className="text-lg md:text-2xl text-gray-200 mb-10 max-w-2xl font-medium drop-shadow-md">
          Fotografía y planificación de bodas que capturan cada momento único
        </p>
        
        <Link 
          href="#portafolio" 
          className="bg-white text-black px-8 py-4 font-bold uppercase tracking-widest text-sm md:text-base brutalist-border-thick brutalist-shadow-hover"
        >
          VER PORTAFOLIO
        </Link>
      </div>
    </section>
  );
}
