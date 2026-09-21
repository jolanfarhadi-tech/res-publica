"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { usePreferences } from "@/components/privacy/PreferenceProvider";
import { architecturalRoomForPath } from "./architecture-camera";
import { architecturalScrollProgress, homeArchitecturalChapters } from "./architecture-motion";
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
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const locale = pathname.split("/")[1];
  const room = architecturalRoomForPath(pathname);
  const statusLabels = locale === "fa" ? { loading: "در حال بارگذاری فضای معماری…", retry: "بارگذاری دوبارهٔ محیط" }
    : locale === "de" ? { loading: "Architektur wird geladen…", retry: "Raum erneut laden" }
    : { loading: "Loading architectural space…", retry: "Reload architectural space" };
  const [requested, setRequested] = useState(room !== null);
  const roomRef = useRef(room); roomRef.current = room;
  const motionRef = useRef(preferences.reduceMotion); motionRef.current = preferences.reduceMotion;

  useEffect(() => {
    if (room) setRequested(true);
  }, [room]);

  useEffect(() => {
    if (!requested || !canvas.current) return;
    let cancelled = false;
    setReady(false); setFailed(false);
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    function motion() { controller.current?.setMotion(media.matches || motionRef.current); }
    motion();
    media.addEventListener("change", motion);
    void import("./cinematic-renderer").then(({ mountCinematicArchitecture }) => {
      if (cancelled || !canvas.current) return;
      controller.current = mountCinematicArchitecture(canvas.current, {
        reducedMotion: media.matches || motionRef.current,
        room: roomRef.current ?? "forum",
        onReady: () => { if (!cancelled) { setReady(true); setFailed(false); } },
        onFailure: () => { if (!cancelled) { setReady(false); setFailed(true); } },
        onRecover: () => { if (!cancelled) setAttempt(value => value + 1); },
      });
      controller.current.setRoom(roomRef.current);
    }).catch(() => { if (!cancelled) { setReady(false); setFailed(true); } });
    return () => { cancelled = true; media.removeEventListener("change", motion); controller.current?.dispose(); controller.current = null; };
  }, [requested, attempt]);

  useEffect(() => {
    controller.current?.setMotion(preferences.reduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, [preferences.reduceMotion]);

  useEffect(() => {
    controller.current?.setRoom(room);
  }, [room]);

  useEffect(() => {
    if (!ready || !room) return;
    const home = document.querySelector<HTMLElement>(".home-stage");
    let frame = 0;
    function update() {
      frame = 0;
      if (!home) {
        const distance = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        controller.current?.setRoomScroll(window.scrollY / distance);
        return;
      }
      const anchors = homeArchitecturalChapters.map(chapter => {
        const section = home?.querySelector(chapter.selector);
        return section ? section.getBoundingClientRect().top + window.scrollY : null;
      });
      if (anchors.some(anchor => anchor === null)) return;
      // Keep the opening shot until actual scrolling; progress then tracks the
      // content continuously instead of starting a delayed 22-second journey.
      anchors[0] = window.innerHeight * .35;
      controller.current?.setScroll(architecturalScrollProgress(anchors as number[], window.scrollY, window.innerHeight));
    }
    function scroll() { if (!frame) frame = requestAnimationFrame(update); }
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", scroll);
    const observer = new ResizeObserver(scroll); observer.observe(home ?? document.body);
    update();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener("scroll", scroll); window.removeEventListener("resize", scroll); };
  }, [ready, room, pathname]);

  return (
    <PreviewContext.Provider value={true}>
      <div className="architectural-backdrop" data-room={room ?? "quiet"} aria-hidden="true" />
      {requested && <div className="cinematic-building" data-ready={ready && !!room} aria-hidden="true">
        <canvas key={attempt} ref={canvas} className="cinematic-building__canvas" data-scene="continuous-civic-building" data-baseline="34aeb99" />
      </div>}
      {requested && room && !ready && (failed
        ? <div className="architecture-load-status" role="status"><button type="button" onClick={() => setAttempt(value => value + 1)}>{statusLabels.retry}</button></div>
        : <div className="architecture-load-status" role="status">{statusLabels.loading}</div>)}
      {/* Motion follows the site's accessibility settings, never a floating control. */}
      {children}
    </PreviewContext.Provider>
  );
}
