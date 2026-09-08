import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { isAdminRole } from '@/lib/auth';

export const getAdmin = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('user_roles').select('role').eq('id', user.id).maybeSingle();
  return isAdminRole(data?.role) ? { id: user.id, role: data.role } : null;
});

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin || admin.role === 'editor') throw new Error('No autorizado');
  return admin;
}
