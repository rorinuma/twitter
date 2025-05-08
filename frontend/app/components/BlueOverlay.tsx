"use client";

import clsx from "clsx";
import { motion, useReducedMotion } from "motion/react";

interface Props {
  children: React.ReactNode;
  centered?: boolean;

  mobileNav?: boolean;
}

export default function BlueOverlay({
  children,
  mobileNav,
  centered = true,
}: Props) {
  const shouldReduceMotion = useReducedMotion();

  const modalVariants = shouldReduceMotion
    ? {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
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
      className={clsx(
        "flex grow shrink fixed inset-0 z-20 bg-background xs:bg-blue-overlay",
        {
          "justify-center": centered,
          "bg-blue-overlay": mobileNav,
        },
      )}
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
