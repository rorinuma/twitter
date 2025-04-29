import { useEffect } from "react";

export function useCloseOnBreakpoint(
  isOpen: boolean,
  closeFn: () => void,
  breakpoint: number
) {
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (window.innerWidth > breakpoint && isOpen) {
          closeFn();
        }
      }, 100);
    };

    if (isOpen) window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, closeFn, breakpoint]);
}
