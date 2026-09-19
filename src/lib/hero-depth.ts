export type HeroPose = {
  rotateX: number;
  rotateY: number;
  lightX: number;
  lightY: number;
};

export const neutralHeroPose: HeroPose = {
  rotateX: 0,
  rotateY: 0,
  lightX: 0,
  lightY: 0,
};

export function getHeroPose(
  clientX: number,
  clientY: number,
  bounds: Pick<DOMRect, "left" | "top" | "width" | "height">,
): HeroPose {
  if (bounds.width <= 0 || bounds.height <= 0) return neutralHeroPose;

  const horizontal = Math.max(-1, Math.min(1, ((clientX - bounds.left) / bounds.width - 0.5) * 2));
  const vertical = Math.max(-1, Math.min(1, ((clientY - bounds.top) / bounds.height - 0.5) * 2));

  return {
    rotateX: vertical === 0 ? 0 : -vertical * 2.2,
    rotateY: horizontal * 3.2,
    lightX: horizontal * 18,
    lightY: vertical * 10,
  };
}
