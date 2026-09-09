export function ParallaxMedia({ children }: { children: React.ReactNode }) {
  return (
    <div data-parallax-frame className="absolute inset-0 overflow-hidden [clip-path:inset(0)]">
      <div data-parallax-media className="fixed inset-0 overflow-hidden [container-type:size] motion-reduce:absolute">
        {children}
      </div>
    </div>
  );
}
