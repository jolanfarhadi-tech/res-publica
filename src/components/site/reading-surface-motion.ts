export const readingMotion = {
  distance: 12,
  spring: { stiffness: 90, damping: 32, mass: .8, restDelta: .1 },
};

/** Small depth response, never a layout reorder, perpetual drift or pointer pursuit. */
export function readingSurfaceOffset(top: number, height: number, viewport: number) {
  if (viewport <= 0 || top > viewport || top + height < 0) return 0;
  const progress = (top + height * .5 - viewport * .5) / viewport;
  return Math.max(-readingMotion.distance, Math.min(readingMotion.distance, progress * readingMotion.distance));
}
