import { redirect } from 'next/navigation';
import { getAdmin } from '@/core/services/authService';

export default async function AdminIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const admin = await getAdmin();
  redirect(`/${locale}/admin/${admin?.role === 'editor' ? 'blog' : 'dashboard'}`);
}
