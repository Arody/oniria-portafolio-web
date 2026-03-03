'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Image as ImageIcon, FileText, MessageSquare, Settings, LogOut } from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Portafolio', href: '/admin/portfolio', icon: ImageIcon },
    { name: 'Blog', href: '/admin/blog', icon: FileText },
    { name: 'Mensajes', href: '/admin/messages', icon: MessageSquare },
    { name: 'Configuración', href: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="fixed top-0 left-0 w-64 h-screen bg-charcoal text-ivory flex flex-col border-r border-graphite z-50">
      <div className="p-6 border-b border-graphite">
        <h1 className="text-sm font-serif font-light uppercase tracking-[0.25em] text-ivory">
          ONIRIA <span className="text-champagne">Admin</span>
        </h1>
      </div>

      <nav className="flex-grow py-6">
        <ul className="space-y-1 px-4">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 font-sans uppercase text-[11px] tracking-[0.15em] transition-all duration-300 border ${
                    isActive 
                    ? 'bg-champagne/10 text-champagne border-champagne/30'
                    : 'bg-transparent text-mist/50 border-transparent hover:text-ivory hover:bg-graphite/30 hover:border-graphite/50'
                  }`}
                >
                  <link.icon className="w-4 h-4 shrink-0" />
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-graphite">
        <button className="w-full flex items-center justify-center gap-3 px-4 py-3 font-sans uppercase text-[11px] tracking-[0.15em] text-red-400/70 border border-red-400/20 hover:bg-red-400/10 hover:text-red-400 hover:border-red-400/40 transition-all duration-300">
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
