"use client";

import { motion, useReducedMotion } from "motion/react";

export default function BlueOverlay({
  children,
}: {
  children: React.ReactNode;
}) {
  const shouldReduceMotion = useReducedMotion();

  const modalVariants = shouldReduceMotion
    ? {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 1 },
    }
    : {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    };
  const modalTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.3 };

  return (
    <motion.section
      className="flex fixed bg-blue-overlay inset-0 z-20"
      variants={modalVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={modalTransition}
    >
      {children}
    </motion.section>
  );
}
