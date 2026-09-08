'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/core/services/authService';

export async function revalidateGlobalSettings() {
  await requireAdmin();
  revalidatePath('/', 'layout');
  return { success: true };
}
