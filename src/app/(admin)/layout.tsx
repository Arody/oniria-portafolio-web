import { AdminSidebar } from "@/ui/layouts/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 ml-64 flex flex-col">
        {/* Top Header Placeholder */}
        <header className="bg-white border-b-2 border-black h-16 flex items-center justify-between px-8 shrink-0">
          <h2 className="font-bold uppercase tracking-widest text-lg">PANEL DE ADMINISTRACIÓN</h2>
          <div className="flex items-center gap-3">
             <span className="font-bold text-sm">Admin Name</span>
             <div className="w-8 h-8 bg-gray-300 border-2 border-black shrink-0"></div>
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
