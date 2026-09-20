"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { usePreferences } from "@/components/privacy/PreferenceProvider";
import { architecturalRoomForPath } from "./architecture-camera";
import { architectureMotion, homeArchitecturalChapters } from "./architecture-motion";
import type { CinematicController } from "./cinematic-renderer";

const PreviewContext = createContext(true);
export const useCinematicPreview = () => useContext(PreviewContext);

/** One public architectural shell; static, readable fallback on every route. */
export function CinematicArchitecture({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { preferences } = usePreferences();
  const canvas = useRef<HTMLCanvasElement>(null);
  const controller = useRef<CinematicController | null>(null);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const [systemReduced, setSystemReduced] = useState(false);
  const locale = pathname.split("/")[1];
  const labels = locale === "fa" ? { pause: "توقف دوربین", play: "حرکت دوربین", reduced: "حرکت کاهش‌یافته" }
    : locale === "de" ? { pause: "Kamera anhalten", play: "Kamera starten", reduced: "Bewegung reduziert" }
    : { pause: "Pause camera", play: "Play camera", reduced: "Reduced motion" };
  const room = architecturalRoomForPath(pathname);
  const [requested, setRequested] = useState(room !== null);
  const roomRef = useRef(room); roomRef.current = room;
  const motionRef = useRef(preferences.reduceMotion); motionRef.current = preferences.reduceMotion;

  useEffect(() => {
    if (room) setRequested(true);
  }, [room]);

  useEffect(() => {
    if (!requested || !canvas.current) return;
    let cancelled = false;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    function motion() { setSystemReduced(media.matches); controller.current?.setMotion(media.matches || motionRef.current); }
    motion();
    media.addEventListener("change", motion);
    void import("./cinematic-renderer").then(({ mountCinematicArchitecture }) => {
      if (cancelled || !canvas.current) return;
      controller.current = mountCinematicArchitecture(canvas.current, {
        reducedMotion: media.matches || motionRef.current,
        room: roomRef.current ?? "forum",
        onReady: () => { if (!cancelled) setReady(true); },
        onFailure: () => { if (!cancelled) setReady(false); },
      });
      controller.current.setRoom(roomRef.current);
    }).catch(() => { if (!cancelled) setReady(false); });
    return () => { cancelled = true; media.removeEventListener("change", motion); controller.current?.dispose(); controller.current = null; };
  }, [requested]);

  useEffect(() => {
    controller.current?.setMotion(preferences.reduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, [preferences.reduceMotion]);

  useEffect(() => { controller.current?.setPaused(paused); }, [paused, ready]);

  useEffect(() => {
    controller.current?.setRoom(room);
  }, [room]);

  useEffect(() => {
    if (!ready || room !== "forum") return;
    const home = document.querySelector<HTMLElement>(".home-stage");
    if (!home) return;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    function update() {
      let active = homeArchitecturalChapters[0].room;
      for (const chapter of homeArchitecturalChapters) {
        const section = home?.querySelector(chapter.selector);
        if (section && section.getBoundingClientRect().top <= window.innerHeight * .45) active = chapter.room;
      }
      controller.current?.setRoom(active);
    }
    function scroll() { clearTimeout(timeout); timeout = setTimeout(update, architectureMotion.readingDebounce); }
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", scroll);
    const observer = new ResizeObserver(scroll); observer.observe(home);
    update();
    return () => { clearTimeout(timeout); observer.disconnect(); window.removeEventListener("scroll", scroll); window.removeEventListener("resize", scroll); };
  }, [ready, room, pathname]);

  return (
    <PreviewContext.Provider value={true}>
      <div className="architectural-backdrop" data-room={room ?? "quiet"} aria-hidden="true" />
      {requested && <div className="cinematic-building" data-ready={ready && !!room} aria-hidden="true">
        <canvas ref={canvas} className="cinematic-building__canvas" data-scene="continuous-civic-building" data-baseline="34aeb99" />
      </div>}
      {ready && room && <button className="architecture-camera-control" type="button"
        aria-pressed={paused || preferences.reduceMotion || systemReduced}
        disabled={preferences.reduceMotion || systemReduced}
        onClick={() => setPaused((value) => !value)}>
        <svg viewBox="0 0 20 20" aria-hidden="true" width="16" height="16" fill="currentColor">
          {paused || preferences.reduceMotion || systemReduced ? <path d="M6 3 17 10 6 17Z" /> : <path d="M5 3h3v14H5zm7 0h3v14h-3z" />}
        </svg>
        {preferences.reduceMotion || systemReduced ? labels.reduced : paused ? labels.play : labels.pause}
      </button>}
      {children}
    </PreviewContext.Provider>
  );
}
