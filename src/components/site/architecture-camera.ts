export type ArchitecturalRoom = "forum" | "library" | "studio" | "gallery" | "editorial" | "review" | "learning";
export type CameraPose = { position: [number, number, number]; target: [number, number, number]; fov: number };

/** All poses belong to the same building, in metres. No unbounded orbit. */
export const architecturalShots: Record<ArchitecturalRoom, CameraPose> = {
  forum: { position: [2.4, 6.15, 13.6], target: [-.3, 2.3, -4], fov: 55 },
  // Elevated establishing shots: furniture and architecture, not foreground faces.
  library: { position: [12, 3.4, 16.5], target: [15.8, 1.65, -9], fov: 60 },
  studio: { position: [-12, 3.4, 16.5], target: [-15.6, 1.3, -7], fov: 60 },
  gallery: { position: [-4.8, 7.8, 12.8], target: [0, 2.5, -4], fov: 52 },
  editorial: { position: [14.45, 2.2, -16.7], target: [14.8, 1.5, -19.1], fov: 72 },
  review: { position: [-11.1, 1.85, -14.7], target: [-15, 1.7, -18], fov: 60 },
  learning: { position: [-12, 6.4, 3], target: [-15, 5.9, -9], fov: 56 },
};

/** Deliberately allowlisted: personal, legal and operational pages stay still. */
export function architecturalRoomForPath(path: string): ArchitecturalRoom | null {
  const match = /^\/(de|en|fa)(?:\/(.*))?$/.exec(path.replace(/\/$/, ""));
  if (!match) return null;
  const segment = (match[2] ?? "").split("/")[0];
  if (!segment) return "forum";
  if (segment === "publications") return "editorial";
  if (["knowledge", "news"].includes(segment)) return "library";
  if (segment === "method") return "review";
  if (["programs", "products", "services"].includes(segment)) return "learning";
  if (["research", "lab", "projects"].includes(segment)) return "studio";
  if (["about", "team", "mission-vision", "events", "communities", "partners"].includes(segment)) return "gallery";
  return null;
}

export function cinematicEase(value: number) {
  const t = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export function interpolateCamera(a: CameraPose, b: CameraPose, progress: number): CameraPose {
  const t = cinematicEase(progress);
  if (t === 0 || t === 1) {
    const endpoint = t === 0 ? a : b;
    return { position: [...endpoint.position], target: [...endpoint.target], fov: endpoint.fov };
  }
  const blend = (v: number, i: number, destination: number[]) => v + (destination[i] - v) * t;
  return {
    position: a.position.map((v, i) => blend(v, i, b.position)) as CameraPose["position"],
    target: a.target.map((v, i) => blend(v, i, b.target)) as CameraPose["target"],
    fov: a.fov + (b.fov - a.fov) * t,
  };
}

export type CameraTravel = { from: CameraPose; to: CameraPose; points: CameraPose["position"][]; lengths: number[]; distance: number; duration: number };

export const cameraMotion = { cornerRadius: .65, cornerSamples: 20, minimumDuration: 3200, maximumDuration: 22000, metresPerSecond: 2.6 };

/** Tangent-continuous corner fillets; stay inside the authored circulation envelope. */
export function roundedCameraPath(source: CameraPose["position"][]) {
  const distance = (a: number[], b: number[]) => Math.hypot(...a.map((v, i) => v - b[i]));
  const points = source.filter((point, i) => i === 0 || distance(point, source[i - 1]) > .001);
  if (points.length < 3) return points;
  const rounded: CameraPose["position"][] = [points[0]];
  const mix = (a: number[], b: number[], t: number) => a.map((v, j) => v + (b[j] - v) * t) as CameraPose["position"];
  for (let i = 1; i < points.length - 1; i++) {
    const a = points[i - 1], b = points[i], c = points[i + 1];
    const incoming = distance(a, b), outgoing = distance(b, c);
    const trim = Math.min(cameraMotion.cornerRadius, incoming * .2, outgoing * .2);
    const entry = mix(b, a, trim / incoming), exit = mix(b, c, trim / outgoing);
    rounded.push(entry);
    for (let sample = 1; sample <= cameraMotion.cornerSamples; sample++) {
      const t = sample / cameraMotion.cornerSamples;
      rounded.push(mix(mix(entry, b, t), mix(b, exit, t), t));
    }
  }
  rounded.push(points[points.length - 1]);
  return rounded;
}

/** Route through the open atrium/circulation aisle, never through the mezzanine slab. */
export function planCameraTravel(from: CameraPose, to: CameraPose): CameraTravel {
  const a = from.position, b = to.position;
  const upperA = a[1] > 4.5, upperB = b[1] > 4.5;
  const points: CameraPose["position"][] = [a];
  const samePose = a.every((v, i) => Math.abs(v - b[i]) < 0.001);
  if (!samePose && upperA !== upperB) {
    const side = (upperA ? b[0] : a[0]) < 0 ? -1 : 1;
    if (upperA) points.push([side * 7.5, a[1], 12], [side * 7.5, b[1], 12], [b[0], b[1], 12]);
    else points.push([a[0], a[1], 12], [side * 7.5, a[1], 12], [side * 7.5, b[1], 12]);
  } else if (!samePose && !upperA && Math.sign(a[0]) !== Math.sign(b[0])) {
    points.push([a[0], a[1], 12], [b[0], b[1], 12]);
  }
  points.push(b);
  const route = roundedCameraPath(points);
  const lengths = route.slice(1).map((p, i) => Math.hypot(...p.map((v, j) => v - route[i][j])));
  const distance = lengths.reduce((sum, value) => sum + value, 0);
  return { from, to, points: route, lengths, distance, duration: Math.max(cameraMotion.minimumDuration, Math.min(cameraMotion.maximumDuration, distance / cameraMotion.metresPerSecond * 1000)) };
}

export function sampleCameraTravel(travel: CameraTravel, progress: number): CameraPose {
  const pose = interpolateCamera(travel.from, travel.to, progress);
  if (progress <= 0 || progress >= 1 || travel.distance < 0.001) return pose;
  let distance = cinematicEase(progress) * travel.distance;
  for (let i = 0; i < travel.lengths.length; i++) {
    const length = travel.lengths[i];
    if (distance <= length && length > 0) {
      const t = distance / length;
      pose.position = travel.points[i].map((v, j) => v + (travel.points[i + 1][j] - v) * t) as CameraPose["position"];
      return pose;
    }
    distance -= length;
  }
  return pose;
}
