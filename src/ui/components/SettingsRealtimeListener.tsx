'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function SettingsRealtimeListener() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel('realtime-settings-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'oniria', table: 'settings' },
        (payload) => {
          console.log('[Realtime] Settings changed, refreshing UI:', payload);
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  return null;
}
