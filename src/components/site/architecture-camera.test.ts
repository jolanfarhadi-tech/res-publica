import { describe, expect, it } from "vitest";
import { architecturalRoomForPath, architecturalShots, cinematicEase, interpolateCamera, planCameraTravel, sampleCameraTravel } from "./architecture-camera";

describe("continuous architectural camera", () => {
  it("uses the same room mapping for all three locales", () => {
    for (const locale of ["de", "en", "fa"]) {
      expect(architecturalRoomForPath(`/${locale}`)).toBe("forum");
      expect(architecturalRoomForPath(`/${locale}/`)).toBe("forum");
      expect(architecturalRoomForPath(`/${locale}/publications/article`)).toBe("editorial");
      expect(architecturalRoomForPath(`/${locale}/research`)).toBe("studio");
      expect(architecturalRoomForPath(`/${locale}/method`)).toBe("review");
      expect(architecturalRoomForPath(`/${locale}/programs`)).toBe("learning");
      expect(architecturalRoomForPath(`/${locale}/about`)).toBe("gallery");
      expect(architecturalRoomForPath(`/${locale}/partners`)).toBe("gallery");
      expect(architecturalRoomForPath(`/${locale}/products`)).toBe("learning");
      expect(architecturalRoomForPath(`/${locale}/services`)).toBe("learning");
    }
  });
  it("gives publications, research, HARM and programmes distinct authored views", () => {
    const rooms = ["publications", "research", "method", "programs"].map(path => architecturalRoomForPath(`/fa/${path}`)!);
    expect(new Set(rooms).size).toBe(4);
    expect(new Set(rooms.map(room => JSON.stringify(architecturalShots[room]))).size).toBe(4);
  });
  it("never turns protected, consent, legal or form routes into moving scenes", () => {
    for (const locale of ["de", "en", "fa"]) for (const path of ["membership", "profile", "dashboard", "operations", "admin", "privacy", "datenschutz", "contact", "auth/error", "unknown"]) {
      expect(architecturalRoomForPath(`/${locale}/${path}`)).toBeNull();
    }
    expect(architecturalRoomForPath("/api/auth/login")).toBeNull();
    expect(architecturalRoomForPath("/xx/research")).toBeNull();
  });
  it("starts and ends at the exact authored poses without overshoot", () => {
    const a = architecturalShots.forum, b = architecturalShots.library;
    expect(interpolateCamera(a, b, -1)).toEqual(a);
    expect(interpolateCamera(a, b, 0)).toEqual(a);
    expect(interpolateCamera(a, b, 1).position).toEqual(b.position);
    expect(interpolateCamera(a, b, 2).position).toEqual(b.position);
    for (let i = 0; i <= 100; i++) {
      const pose = interpolateCamera(a, b, i / 100);
      for (const [index, value] of pose.position.entries()) {
        expect(value).toBeGreaterThanOrEqual(Math.min(a.position[index], b.position[index]));
        expect(value).toBeLessThanOrEqual(Math.max(a.position[index], b.position[index]));
      }
    }
  });
  it("has gentle acceleration and deceleration with finite poses", () => {
    expect(cinematicEase(NaN)).toBe(0);
    expect(cinematicEase(0.001)).toBeLessThan(0.000001);
    expect(1 - cinematicEase(0.999)).toBeLessThan(0.000001);
    expect(cinematicEase(0.5)).toBe(0.5);
    for (const pose of Object.values(architecturalShots)) {
      expect([...pose.position, ...pose.target, pose.fov].every(Number.isFinite)).toBe(true);
      expect(pose.position[1]).toBeGreaterThanOrEqual(1.8);
      expect(pose.position[1]).toBeLessThan(10.5);
    }
  });
  it("descends through the atrium rather than through the upper floor", () => {
    for (const destination of [architecturalShots.library, architecturalShots.studio, architecturalShots.editorial, architecturalShots.review]) {
      for (const [from, to] of [[architecturalShots.forum, destination], [destination, architecturalShots.gallery], [architecturalShots.learning, destination]]) {
        const travel = planCameraTravel(from, to);
        expect(sampleCameraTravel(travel, 0)).toEqual(from);
        expect(sampleCameraTravel(travel, 1).position).toEqual(to.position);
        for (let i = 0; i <= 1000; i++) {
          const { position: [x, y, z] } = sampleCameraTravel(travel, i / 1000);
          if (y > 4.1 && y < 4.55) {
            expect(Math.abs(x)).toBeLessThan(10.5);
            expect(z).toBeLessThan(14.3);
          }
        }
      }
    }
  });
  it("crosses between ground-floor rooms via the front circulation aisle", () => {
    const travel = planCameraTravel(architecturalShots.library, architecturalShots.studio);
    const crossing = travel.points.filter(point => Math.abs(point[0]) < 10.5);
    expect(crossing.every(point => point[2] >= 11.35 && point[2] <= 12)).toBe(true);
    expect(travel.duration).toBeGreaterThan(4200);
    const staticShot = planCameraTravel(architecturalShots.forum, architecturalShots.forum);
    expect(staticShot.distance).toBe(0);
  });
  it("rounds circulation corners instead of changing direction by ninety degrees", () => {
    for (const from of Object.values(architecturalShots)) for (const to of Object.values(architecturalShots)) {
      const { points } = planCameraTravel(from, to);
      for (let i = 1; i < points.length - 1; i++) {
        const a = points[i].map((v, j) => v - points[i - 1][j]);
        const b = points[i + 1].map((v, j) => v - points[i][j]);
        const dot = a.reduce((sum, v, j) => sum + v * b[j], 0) / (Math.hypot(...a) * Math.hypot(...b));
        expect(dot).toBeGreaterThan(.96);
      }
    }
  });
});
