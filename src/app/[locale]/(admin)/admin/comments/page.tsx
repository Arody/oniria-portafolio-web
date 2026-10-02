import { requireAdmin } from '@/core/services/authService';
import { getTestimonials } from '@/core/services/testimonialService';
import { getDictionary } from '@/lib/dictionaries';
import type { Locale } from '@/i18n.config';
import { TestimonialsManager } from '@/ui/components/TestimonialsManager';

export default async function CommentsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  await requireAdmin();
  const { locale } = await params;
  const [items, dict] = await Promise.all([getTestimonials(), getDictionary(locale)]);
  return <TestimonialsManager initial={items} dict={dict.testimonials.admin} />;
}
