"use client";

import { useEffect, useRef, useState } from "react";
import { usePreferences } from "@/components/privacy/PreferenceProvider";

export function ForumLustre3D() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(false);
  const { preferences } = usePreferences();

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cancelled = false;
    let running = false;
    let generation = 0;
    let dispose = () => {};

    async function start() {
      if (!canvas.current) return;
      running = true;
      const currentGeneration = ++generation;
      try {
        const { mountForumLustre } = await import("./forum-lustre-three");
        if (cancelled || currentGeneration !== generation || !canvas.current) return;
        dispose = mountForumLustre(canvas.current, () => {
          if (!cancelled) setActive(true);
        }, {
          reducedMotion: reducedMotion.matches || preferences.reduceMotion,
          onFailure: () => { if (!cancelled) setActive(false); },
        });
      } catch {
        running = false;
        // Keep the accessible architectural image if WebGL is unavailable.
      }
    }

    function syncMotionPreference() {
      if (running) {
        generation += 1;
        dispose();
        dispose = () => {};
        running = false;
        setActive(false);
      }
      if (!running) {
        void start();
      }
    }

    reducedMotion.addEventListener("change", syncMotionPreference);
    syncMotionPreference();
    return () => {
      cancelled = true;
      generation += 1;
      reducedMotion.removeEventListener("change", syncMotionPreference);
      dispose();
    };
  }, [preferences.reduceMotion]);

  return (
    <div className="forum-hero__live" data-active={active} aria-hidden="true">
      <canvas ref={canvas} className="forum-hero__canvas" data-scene="complete-architecture" />
    </div>
  );
}
