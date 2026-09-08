import type { Dictionary } from '@/lib/dictionaries';

export function validateContact(input: unknown) {
  if (!input || typeof input !== 'object') throw new Error('Invalid contact');
  const data = input as Record<string, unknown>;
  const text = (key: string) => typeof data[key] === 'string' ? data[key].trim() : '';
  const result = {
    id: text('id'), name: text('name'), email: text('email'), phone: text('phone'),
    date: text('date'), planner: text('planner'), venue: text('venue'), guests: text('guests'),
    otherContact: text('otherContact'), vision: text('vision'), highlights: text('highlights'), website: text('website'),
  };
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(result.id)
    || result.name.length < 2 || result.name.length > 120
    || result.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email)
    || !result.phone || result.phone.length > 40
    || !result.planner || result.planner.length > 160
    || !result.venue || result.venue.length > 300
    || !/^\d{1,6}$/.test(result.guests) || Number(result.guests) < 1 || Number(result.guests) > 100000
    || result.otherContact.length > 200
    || result.vision.length < 10 || result.vision.length > 2000
    || result.highlights.length < 10 || result.highlights.length > 2000
    || !/^\d{4}-\d{2}-\d{2}$/.test(result.date) || !Number.isFinite(Date.parse(result.date))
    || new Date(result.date).toISOString().slice(0, 10) !== result.date) {
    throw new Error('Invalid contact');
  }
  return result;
}

export function formatContactMessage(data: ReturnType<typeof validateContact>, labels: Dictionary['contact']['form']) {
  // ponytail: answers share the existing 5,000-character message; use columns if filtering by answer is needed.
  const message = (['planner', 'venue', 'guests', 'otherContact', 'vision', 'highlights'] as const)
    .map(key => `${labels[key]}:\n${data[key] || '—'}`).join('\n\n');
  if (message.length > 5000) throw new Error('Invalid contact');
  return message;
}
