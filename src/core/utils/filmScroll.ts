export function getFilmScrollTarget(left: number, viewport: number, contentWidth: number, direction: -1 | 1) {
  const end = Math.max(0, contentWidth - viewport);
  if (direction === 1 && left >= end - 2) return 0;
  if (direction === -1 && left <= 2) return end;
  return Math.max(0, Math.min(end, left + viewport * direction));
}
