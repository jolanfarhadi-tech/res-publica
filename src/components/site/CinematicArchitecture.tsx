"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { usePreferences } from "@/components/privacy/PreferenceProvider";
import { architecturalRoomForPath } from "./architecture-camera";
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
    function motion() { controller.current?.setMotion(media.matches || motionRef.current); }
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

  useEffect(() => {
    controller.current?.setRoom(room);
  }, [room]);

  useEffect(() => {
    if (!ready || room !== "forum") return;
    // Observe the whole layout, not merely whichever entries changed this frame.
    // Debounce scroll so one deliberate camera move follows a settled reading position.
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const sections = [...document.querySelectorAll(".home-hero, .home-section--gateways, .home-section--team, .home-section--latest")];
    function selectRoom() {
      const marker = window.innerHeight * 0.55;
      let active = sections[0];
      for (const section of sections) if (section.getBoundingClientRect().top <= marker) active = section;
      if (!active) return;
      controller.current?.setRoom(active.classList.contains("home-section--latest") ? "library"
        : active.classList.contains("home-section--gateways") ? "studio"
          : active.classList.contains("home-hero") ? "forum" : "gallery");
    }
    function scroll() { clearTimeout(timeout); timeout = setTimeout(selectRoom, 180); }
    window.addEventListener("scroll", scroll, { passive: true });
    selectRoom();
    return () => { clearTimeout(timeout); window.removeEventListener("scroll", scroll); };
  }, [ready, room, pathname]);

  return (
    <PreviewContext.Provider value={true}>
      <div className="architectural-backdrop" data-room={room ?? "quiet"} aria-hidden="true" />
      {requested && <div className="cinematic-building" data-ready={ready && !!room} aria-hidden="true">
        <canvas ref={canvas} className="cinematic-building__canvas" data-scene="continuous-civic-building" />
      </div>}
      {children}
    </PreviewContext.Provider>
  );
}
