import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/core/services/authService';
import { setMessageRead } from '@/core/actions/messageActions';
import { getDictionary } from '@/lib/dictionaries';
import type { Locale } from '@/i18n.config';
import Link from 'next/link';

export default async function MessagesPage({ params, searchParams }: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin();
  const { locale } = await params;
  const dict = (await getDictionary(locale)).messages;
  const page = Math.max(1, Number.parseInt((await searchParams).page || '1', 10) || 1);
  const supabase = await createClient();
  const { data, error, count } = await supabase.from('messages').select('*', { count: 'exact' })
    .order('created_at', { ascending: false }).range((page - 1) * 20, page * 20 - 1);
  if (error) throw error;
  return <div className="max-w-5xl mx-auto space-y-6">
    <h1 className="text-3xl font-serif text-ivory">{dict.title} ({count})</h1>
    {data?.map(message => <article id={message.id} key={message.id} className="bg-charcoal border border-graphite p-6 space-y-4 scroll-mt-20">
      <div className="flex flex-wrap justify-between gap-3">
        <h2 className="text-xl font-serif">{message.full_name}</h2>
        <span className="text-xs text-champagne">{message.is_read ? dict.read : dict.unread}</span>
      </div>
      <p className="text-sm text-mist/60">{new Date(message.created_at).toLocaleString(locale)}</p>
      <a className="text-champagne break-all" href={`mailto:${message.email}`}>{message.email}</a>
      {message.phone && <p>{message.phone}</p>}
      {message.event_date && <p>{dict.event_date}: {message.event_date}</p>}
      <p className="whitespace-pre-wrap break-words text-mist">{message.message}</p>
      <form action={setMessageRead.bind(null, message.id, !message.is_read)}>
        <button className="border border-champagne/40 px-4 py-2 text-sm text-champagne">{message.is_read ? dict.mark_unread : dict.mark_read}</button>
      </form>
    </article>)}
    {!data?.length && <p className="text-mist/60">{dict.empty}</p>}
    <nav className="flex gap-6 text-champagne" aria-label={dict.pagination}>
      {page > 1 && <Link href={`?page=${page - 1}`}>{dict.previous}</Link>}
      {page * 20 < (count ?? 0) && <Link href={`?page=${page + 1}`}>{dict.next}</Link>}
    </nav>
  </div>;
}
