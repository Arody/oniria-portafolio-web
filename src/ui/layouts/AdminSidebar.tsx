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
    <aside className="fixed top-0 left-0 w-64 h-screen bg-black text-white flex flex-col border-r-4 border-black z-50">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-black uppercase tracking-tighter">
          ONIRIA ADMIN
        </h1>
      </div>

      <nav className="flex-grow py-6">
        <ul className="space-y-2 px-4">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 font-bold uppercase text-sm brutalist-border transition-colors ${
                    isActive 
                      ? 'bg-white text-black' 
                      : 'bg-transparent text-gray-300 border-transparent hover:border-gray-500 hover:text-white'
                  }`}
                >
                  <link.icon className="w-5 h-5 shrink-0" />
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button className="w-full flex items-center justify-center gap-3 px-4 py-3 font-bold uppercase text-sm text-red-500 brutalist-border border-red-500 hover:bg-red-500 hover:text-white transition-colors">
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
