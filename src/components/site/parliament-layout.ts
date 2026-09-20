/** Metres; furniture faces local -Z. One source for chairs, desks and occupants. */
export const parliamentFocus = { x: 0, z: -4.5 };
export const parliamentAisleHalfWidth = 1.15;
export const parliamentDeskInset = .78;
export type ParliamentSeat = {
  x: number; y: number; z: number; yaw: number; row: number;
  desk: { x: number; z: number };
};

export function createParliamentLayout(): ParliamentSeat[] {
  const seats: ParliamentSeat[] = [];
  for (const [row, radius] of [3.65, 5.55, 7.45].entries()) {
    for (const side of [-1, 1]) {
      const points = [-5.7, -3, -0.3].map(z => ({ x: side * radius, z, inwardX: -side, inwardZ: 0 }));
      for (const angle of [.36, .71, 1.02]) points.push({ x: side * radius * Math.cos(angle), z: radius * Math.sin(angle), inwardX: -side * Math.cos(angle), inwardZ: -Math.sin(angle) });
      for (const point of points) {
        const dx = parliamentFocus.x - point.x, dz = parliamentFocus.z - point.z;
        seats.push({ x: point.x, z: point.z, row, y: row * .32,
          yaw: Math.atan2(-dx, -dz),
          desk: { x: point.x + point.inwardX * parliamentDeskInset, z: point.z + point.inwardZ * parliamentDeskInset } });
      }
    }
  }
  return seats;
}

/** Standing observers occupy circulation, never worktop footprints. */
export const standingObservers = [
  { model: 4, x: 11.6, y: 0, z: 4.4, yaw: -.4 },
  { model: 2, x: 18.4, y: 0, z: -.8, yaw: .5 },
  { model: 5, x: -11.3, y: 0, z: 2.4, yaw: .2 },
  { model: 3, x: -18.7, y: 0, z: 7.6, yaw: -1 },
  { model: 1, x: 15, y: 4.46, z: 5.2, yaw: 1.7 },
];

/** Pelvis outside the 1.4m worktop, hands reach the near-edge document area. */
export const researchParticipants = [
  { model: 0, x: -16.7, y: 0, z: 6.13, yaw: 0 },
  { model: 3, x: -14.1, y: 0, z: 3.87, yaw: Math.PI },
  { model: 5, x: -16.4, y: 0, z: .13, yaw: 0 },
  { model: 2, x: -13.5, y: 0, z: -2.13, yaw: Math.PI },
] as const;
