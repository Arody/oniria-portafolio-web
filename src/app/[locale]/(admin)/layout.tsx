import { AdminSidebar } from "@/ui/layouts/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-obsidian">
      <AdminSidebar />
      <main className="flex-1 ml-64 flex flex-col">
        {/* Top Header */}
        <header className="bg-charcoal border-b border-graphite h-16 flex items-center justify-between px-8 shrink-0">
          <h2 className="font-sans text-xs uppercase tracking-[0.3em] text-mist/60">Panel de Administración</h2>
          <div className="flex items-center gap-3">
            <span className="font-sans text-xs text-mist/50 tracking-wider">Admin</span>
            <div className="w-8 h-8 bg-graphite border border-graphite shrink-0 rounded-sm"></div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
