export function createFilmPreview(onChange: (id: string | null) => void) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const stop = () => {
    clearTimeout(timer);
    timer = undefined;
    onChange(null);
  };
  return {
    stop,
    start(id: string) {
      stop();
      timer = setTimeout(() => onChange(id), 250);
    },
  };
}
