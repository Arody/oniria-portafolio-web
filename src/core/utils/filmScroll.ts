export function getFilmScrollTarget(left: number, viewport: number, contentWidth: number, direction: -1 | 1) {
  const end = Math.max(0, contentWidth - viewport);
  if (direction === 1 && left >= end - 2) return 0;
  if (direction === -1 && left <= 2) return end;
  return Math.max(0, Math.min(end, left + viewport * direction));
}

// Complete rows and a complete film sequence make the seam identical at every width.
export function getFilmLoopSize(count: number, columns: number, visibleRows: number) {
  if (count <= 0) return 0;
  let divisor = count;
  let remainder = columns;
  while (remainder) [divisor, remainder] = [remainder, divisor % remainder];
  const sequence = count * columns / divisor;
  return sequence * Math.max(1, Math.ceil(columns * (visibleRows + 1) / sequence));
}

export function wrapFilmScroll(top: number, cycleHeight: number) {
  if (cycleHeight <= 0) return 0;
  return cycleHeight + ((top % cycleHeight) + cycleHeight) % cycleHeight;
}
