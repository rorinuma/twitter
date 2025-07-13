import { useEffect } from "react";

export function useCloseOnInteraction(
  isOpen: boolean,
  closeFn: () => void,
  options: {
    breakpoint?: number;
    moreThan?: boolean;
    closeOnScroll?: boolean;
    scrollThreshold?: number;
  },
) {
  const {
    breakpoint,
    moreThan = false,
    closeOnScroll = false,
    scrollThreshold = 1,
  } = options;

  useEffect(() => {
    let resizeTimeout: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (
          isOpen &&
          typeof breakpoint === "number" &&
          ((moreThan && window.innerWidth > breakpoint) ||
            (!moreThan && window.innerWidth < breakpoint))
        ) {
          closeFn();
        }
      }, 100);
    };

    const handleScroll = () => {
      if (isOpen && closeOnScroll && window.scrollY >= scrollThreshold) {
        closeFn();
      }
    };

    if (isOpen) {
      if (typeof breakpoint === "number") {
        window.addEventListener("resize", handleResize);
      }
      if (closeOnScroll) {
        window.addEventListener("scroll", handleScroll, { passive: true });
      }
    }

    return () => {
      clearTimeout(resizeTimeout);
      if (typeof breakpoint === "number") {
        window.removeEventListener("resize", handleResize);
      }
      if (closeOnScroll) {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, [isOpen, closeFn, breakpoint, moreThan, closeOnScroll, scrollThreshold]);
}
