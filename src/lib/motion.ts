/**
 * Returns true when the user has requested reduced motion at the OS level.
 * GSAP-driven components should skip or simplify their animations when this is set.
 * (CSS animations are handled globally in globals.css.)
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
