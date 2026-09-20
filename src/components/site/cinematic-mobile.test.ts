import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./cinematic-architecture.css", import.meta.url), "utf8");
const shell = readFileSync(new URL("./CinematicArchitecture.tsx", import.meta.url), "utf8");

describe("continuous mobile architecture regression guards", () => {
  it("retains the full-viewport fixed canvas and transparent section shells", () => {
    expect(css).toContain(".cinematic-building { position: fixed; inset: 0;");
    expect(css).not.toContain("57svh");
    expect(css).not.toContain("transparent 15rem, var(--surface) 32rem");
    expect(css).toContain(":is(.home-section,.home-close,.site-footer) { background: transparent; }");
  });
  it("provides accessible, translated camera controls without changing form preferences", () => {
    for (const label of ["توقف دوربین", "حرکت دوربین", "Kamera anhalten", "Kamera starten", "Pause camera", "Play camera"]) expect(shell).toContain(label);
    expect(shell).toContain("aria-pressed={paused || preferences.reduceMotion || systemReduced}");
    expect(shell).toContain("disabled={preferences.reduceMotion || systemReduced}");
    expect(shell).toContain("controller.current?.setPaused(paused)");
    expect(shell).toContain("homeArchitecturalChapters");
    expect(shell).toContain('data-baseline="34aeb99"');
  });
});
