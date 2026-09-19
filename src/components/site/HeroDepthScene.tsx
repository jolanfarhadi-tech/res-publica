"use client";

import { motion, useReducedMotion, useSpring } from "framer-motion";
import type { PointerEvent, ReactNode } from "react";
import { getHeroPose, neutralHeroPose } from "@/lib/hero-depth";
import { usePreferences } from "@/components/privacy/PreferenceProvider";

const spring = { stiffness: 80, damping: 24, mass: 0.9 };

export function HeroDepthScene({ children }: { children: ReactNode }) {
  const systemReducedMotion = useReducedMotion();
  const { preferences } = usePreferences();
  const reducedMotion = systemReducedMotion || preferences.reduceMotion;
  const lightX = useSpring(0, spring);
  const lightY = useSpring(0, spring);

  function setPose(pose: typeof neutralHeroPose) {
    lightX.set(pose.lightX);
    lightY.set(pose.lightY);
  }

  function onPointerMove(event: PointerEvent<HTMLElement>) {
    if (reducedMotion || event.pointerType !== "mouse") return;
    setPose(getHeroPose(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect()));
  }

  return (
    <motion.figure
      className="forum-hero relative isolate min-w-0"
      style={{ transformPerspective: 1400 }}
      onPointerMove={onPointerMove}
      onPointerLeave={() => setPose(neutralHeroPose)}
    >
      {children}
      <motion.span
        aria-hidden="true"
        className="forum-hero__light"
        style={{ x: lightX, y: lightY }}
      />
    </motion.figure>
  );
}
