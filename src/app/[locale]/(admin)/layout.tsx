import { AdminSidebar } from "@/ui/layouts/AdminSidebar";

import { getAdmin } from "@/core/services/authService";
import Link from "next/link";
import { LogoutButton } from "@/ui/components/LogoutButton";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children, params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const admin = await getAdmin();
  if (!admin) redirect(`/${locale}/login`);
  return (
    <div className="flex min-h-screen bg-obsidian">
      <AdminSidebar role={admin.role} />
      <main className="flex-1 md:ml-64 flex flex-col">
        <nav className="md:hidden flex flex-wrap items-center gap-4 p-4 border-b border-graphite text-sm text-champagne">
          {(admin.role === 'editor' ? ['blog'] : ['dashboard', 'portfolio', 'blog', 'messages', 'settings']).map(path =>
            <Link key={path} href={`/${locale}/admin/${path}`}>{path}</Link>)}
          <LogoutButton />
        </nav>
        {/* Top Header */}
        <header className="bg-charcoal border-b border-graphite h-16 flex items-center justify-between px-8 shrink-0">
          <h2 className="font-sans text-xs uppercase tracking-[0.3em] text-mist/60">Panel de Administración</h2>
          <div className="flex items-center gap-3">
            <span className="font-sans text-xs text-mist/50 tracking-wider">Admin</span>
            <div className="w-8 h-8 bg-graphite border border-graphite shrink-0 rounded-sm"></div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-8 flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
