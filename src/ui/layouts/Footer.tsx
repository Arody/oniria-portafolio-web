import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-black text-white py-12 border-t-4 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-6 md:mb-0">
          <span className="text-2xl font-bold tracking-tighter uppercase">ONIRIA WEDDINGS</span>
        </div>
        
        <div className="flex space-x-6 mb-6 md:mb-0">
           <Link href="/#inicio" className="hover:underline uppercase text-xs tracking-wider">Inicio</Link>
           <Link href="/#portafolio" className="hover:underline uppercase text-xs tracking-wider">Portafolio</Link>
           <Link href="/#blog" className="hover:underline uppercase text-xs tracking-wider">Blog</Link>
           <Link href="/#contacto" className="hover:underline uppercase text-xs tracking-wider">Contacto</Link>
        </div>

        <div className="flex space-x-4 mb-6 md:mb-0">
           {/* Social placeholers */}
           <a href="#" className="font-bold text-xs hover:underline">INSTAGRAM</a>
           <a href="#" className="font-bold text-xs hover:underline">PINTEREST</a>
           <a href="#" className="font-bold text-xs hover:underline">FACEBOOK</a>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 text-center md:text-left text-gray-400 text-xs">
         © {new Date().getFullYear()} Oniria Weddings. Todos los derechos reservados.
      </div>
    </footer>
  );
}
