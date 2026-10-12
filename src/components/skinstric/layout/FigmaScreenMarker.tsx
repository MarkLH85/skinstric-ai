export function FigmaScreenMarker({
  screen,
}: {
  screen: string;
}) {
  return (
    <span
      aria-hidden="true"
      data-figma-screen={screen}
      className="pointer-events-none absolute left-0 top-0 hidden"
    />
  );
}
