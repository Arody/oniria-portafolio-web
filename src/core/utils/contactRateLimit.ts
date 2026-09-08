// ponytail: per-process throttle; use a shared store before adding server workers.
const attempts = new Map<string, { count: number; expires: number }>();

export function allowContact(key: string, now = Date.now()) {
  if (attempts.size >= 10000) {
    for (const [key, entry] of attempts) if (entry.expires <= now) attempts.delete(key);
    if (attempts.size >= 10000) return false;
  }
  const previous = attempts.get(key);
  const entry = previous && previous.expires > now ? previous : { count: 0, expires: now + 600000 };
  attempts.set(key, entry);
  return ++entry.count <= 5;
}
