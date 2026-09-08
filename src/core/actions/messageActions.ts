'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/core/services/authService';
import { createClient } from '@/lib/supabase/server';

export async function setMessageRead(id: string, isRead: boolean) {
  await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id) || typeof isRead !== 'boolean') throw new Error('Invalid message');
  const supabase = await createClient();
  const { error } = await supabase.from('messages').update({ is_read: isRead }).eq('id', id).select('id').single();
  if (error) throw error;
  revalidatePath('/[locale]/admin/messages', 'page');
  revalidatePath('/[locale]/admin/dashboard', 'page');
}
