"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePreferences } from "@/components/privacy/PreferenceProvider";

/**
 * FadeIn — the site's one standard entrance animation.
 *
 * Content is rendered visibly before hydration. This avoids hiding core
 * information when JavaScript, IntersectionObserver, or motion is unavailable.
 * Supporting browsers receive a quiet one-time settle into place.
 */
export function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const systemReduceMotion = useReducedMotion();
  const { preferences } = usePreferences();
  const reduceMotion = systemReduceMotion || preferences.reduceMotion;

  return (
    <motion.div
      className={className}
      initial={false}
      whileInView={reduceMotion ? undefined : { opacity: [0.94, 1], y: [8, 0] }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.38, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}
