'use server';

import { revalidatePath } from 'next/cache';

export async function revalidateGlobalSettings() {
  try {
    revalidatePath('/', 'layout');
    revalidatePath('/[locale]', 'layout');
    return { success: true };
  } catch (err: any) {
    console.error('Error revalidating settings cache:', err);
    return { success: false, error: err.message };
  }
}
