"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { usePreferences } from "@/components/privacy/PreferenceProvider";
import { useCinematicPreview } from "./CinematicArchitecture";
import { readingMotion, readingSurfaceOffset } from "./reading-surface-motion";

export function CinematicReadingSurface({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const preview = useCinematicPreview(), reduced = useReducedMotion();
  const { preferences } = usePreferences();
  const [engaged, setEngaged] = useState(false);
  const target = useMotionValue(0), y = useSpring(target, readingMotion.spring);
  const { scrollY } = useScroll();
  const disabled = !preview || reduced || preferences.reduceMotion;
  useEffect(() => { if (disabled) { target.set(0); y.jump(0); } }, [disabled, target, y]);
  useMotionValueEvent(scrollY, "change", () => {
    if (disabled || engaged || !ref.current || window.innerWidth < 768) return;
    const rect = ref.current.getBoundingClientRect();
    target.set(readingSurfaceOffset(rect.top - y.get(), rect.height, window.innerHeight));
  });
  return <motion.div ref={ref} className={`architecture-surface-motion ${className}`} initial={false}
    style={{ y: disabled ? 0 : y }}
    onPointerEnter={() => { setEngaged(true); y.stop(); }}
    onPointerLeave={() => { if (!ref.current?.contains(document.activeElement)) setEngaged(false); }}
    onFocusCapture={() => { setEngaged(true); y.stop(); }}
    onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setEngaged(false); }}>
    {children}
  </motion.div>;
}
