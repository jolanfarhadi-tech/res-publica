import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./cinematic-architecture.css", import.meta.url), "utf8");
const shell = readFileSync(new URL("./CinematicArchitecture.tsx", import.meta.url), "utf8");
const renderer = readFileSync(new URL("./cinematic-renderer.ts", import.meta.url), "utf8");
const switcher = readFileSync(new URL("./LanguageSwitcher.tsx", import.meta.url), "utf8");
const preferences = readFileSync(new URL("../privacy/PreferenceProvider.tsx", import.meta.url), "utf8");

describe("continuous mobile architecture regression guards", () => {
  it("retains static frames and releases GPU contexts across locale boundaries", () => {
    expect(renderer).toContain("preserveDrawingBuffer: true");
    expect(renderer).toContain("renderer.forceContextLoss()");
    expect(renderer.indexOf("options.onReady(); schedule();")).toBeLessThan(renderer.indexOf("await loadArchitecturalDetails"));
    expect(renderer).toContain('canvas.dataset.detailStatus = "unavailable"');
  });
  it("uses native locale navigation without waiting for a client-side scene transition", () => {
    expect(switcher).toContain("<a");
    expect(switcher).toContain("hrefLang={locale}");
    expect(switcher).not.toContain('from "next/link"');
    expect(shell).toContain("requestAnimationFrame(update)");
    expect(shell).not.toContain("setTimeout(update");
  });
  it("retains the full-viewport fixed canvas and transparent section shells", () => {
    expect(css).toContain(".cinematic-building { position: fixed; inset: 0;");
    expect(css).not.toContain("57svh");
    expect(css).not.toContain("transparent 15rem, var(--surface) 32rem");
    expect(css).toContain(":is(.home-section,.home-close,.site-footer) { background: transparent; }");
  });
  it("keeps motion preferences inside site settings instead of floating over content", () => {
    expect(shell).not.toContain("architecture-camera-control");
    expect(css).not.toContain("architecture-camera-control");
    expect(shell).toContain("controller.current?.setMotion(preferences.reduceMotion");
    expect(shell).toContain('window.matchMedia("(prefers-reduced-motion: reduce)")');
    expect(preferences).toContain("label={copy.reduceMotion}");
    expect(preferences).toContain('update("reduceMotion", value)');
    expect(shell).toContain("homeArchitecturalChapters");
    expect(shell).toContain('data-baseline="34aeb99"');
  });
  it("shows the actual building before any architectural asset download", () => {
    expect(renderer.indexOf("options.onReady(); schedule();")).toBeLessThan(renderer.indexOf("await textureLoader.loadAsync"));
    expect(renderer.indexOf("options.onReady(); schedule();")).toBeLessThan(renderer.indexOf('new HDRLoader().loadAsync'));
    expect(renderer).toContain("Promise.allSettled(Object.entries(buildingTextureFiles)");
    expect(renderer).toContain('canvas.dataset.environmentStatus = "unavailable"');
    expect(renderer).toContain('document.activeElement?.closest("input, textarea, select, [contenteditable=');
  });
});
