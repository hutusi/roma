/**
 * Static film-grain overlay for the hero only. A tiled feTurbulence SVG
 * at very low opacity — decorative, non-interactive, deliberately not
 * animated so there is nothing to disable for reduced motion.
 */
const GRAIN_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`;

export function Grain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-multiply"
      style={{ backgroundImage: `url("data:image/svg+xml,${GRAIN_SVG}")` }}
    />
  );
}
