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
      className="fixed bottom-6 left-6 z-[9999] bg-charcoal text-mist/60 border border-graphite px-4 py-2.5 font-sans uppercase tracking-[0.15em] text-[10px] hover:border-champagne/50 hover:text-champagne transition-all duration-400 flex items-center gap-2"
    >
      <LogOut size={14} />
      {isLoading ? 'Saliendo...' : 'Cerrar Sesión'}
    </button>
  );
}
