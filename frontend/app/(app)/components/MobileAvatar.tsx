"use client";

import Avatar from "@/app/components/Avatar";
import { useRef, useState } from "react";
import avatarImage from "@/public/Type.jpg"
import { createPortal } from "react-dom";
import { AnimatePresence, useReducedMotion } from "motion/react";
import { motion } from "motion/react"
import { useClickOutside } from "@/app/utils/clickOutside";
import { useCloseOnBreakpoint } from "@/app/utils/modalClose";
import { FiUser } from "react-icons/fi";
import { IconContext } from "react-icons";
import Link from "next/link";
import { CiBookmark } from "react-icons/ci";
import { IoMdSettings } from "react-icons/io";
import { MdLogout } from "react-icons/md";

export default function MobileAvatar() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const navRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const clickOutside = () => {
    setIsModalOpen(prev => !prev)
  }

  useClickOutside(navRef, () => {
    if (isModalOpen) clickOutside();
  });

  useCloseOnBreakpoint(isModalOpen, () => setIsModalOpen(false), 499);

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

  const slideVariants = shouldReduceMotion
    ? {
      initial: { x: 0 },
      animate: { x: 0 },
      exit: { x: 0 },
    }
    : {
      initial: { x: "-100%" },
      animate: { x: 0 },
      exit: { x: "-100%" },
    };

  const slideTransition = shouldReduceMotion ? { duration: 0.3 } : { duration: 0.3, type: 'tween', ease: "easeOut", }
  const modalTransition = shouldReduceMotion ? { duration: 0 } : { duration: 0.3 };


  return (
    <>
      <button onClick={() => setIsModalOpen(prev => !prev)}>
        <Avatar image={avatarImage} />
      </button>
      {createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <motion.section
              className="flex fixed bg-blue-overlay inset-0 z-10"
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={modalTransition}
            >
              <motion.nav
                className="flex flex-col w-72 p-3 bg-background shadow-default"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={slideTransition}
                ref={navRef}
              >
                <Avatar image={avatarImage} />
                <div>username</div>
                <div className="text-muted">@atUsername</div>
                <div className="flex gap-2 mt-2 text-sm">
                  <div>
                    X <span className="text-muted">Following</span>
                  </div>
                  <div>
                    <div>X <span className="text-muted">Followers</span></div>
                  </div>
                </div>
                <IconContext.Provider value={{ className: "size-6" }}>
                  <div className="flex flex-col mt-6 gap-6">
                    <Link href={`/username`} className="flex items-center gap-4">
                      <div><FiUser /></div>
                      <div className="text-xl font-bold">Profile</div>
                    </Link>
                    <Link href={`/i/bookmarks`} className="flex items-center gap-4">
                      <div><CiBookmark /></div>
                      <div className="text-xl font-bold">Bookmarks</div>
                    </Link>
                    <Link href={`/settings`} className="flex items-center gap-4">
                      <div><IoMdSettings /></div>
                      <div className="text-xl font-bold">Settings</div>
                    </Link>
                    <Link href={`/logout`} className="flex items-center gap-4">
                      <div><MdLogout /></div>
                      <div className="text-xl font-bold">Log Out</div>
                    </Link>
                  </div>
                </IconContext.Provider>
              </motion.nav>
            </motion.section>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
