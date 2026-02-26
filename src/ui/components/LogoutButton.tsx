'use client';

import { createClient } from '@/lib/supabase/client';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    router.refresh(); // Force server components to see the missing session
    router.push('/login');
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="fixed bottom-4 left-4 z-[9999] bg-red-600 text-white border-4 border-black px-4 py-2 font-black uppercase tracking-widest text-sm hover:bg-black transition-colors brutalist-shadow-hover flex items-center gap-2"
    >
      <LogOut size={16} />
      {isLoading ? 'Saliendo...' : 'FORZAR CIERRE DE SESIÓN'}
    </button>
  );
}
