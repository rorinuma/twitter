import { useEffect } from "react"

export const useClickOutside = (ref: React.RefObject<HTMLElement | null>, onClickOutside: () => void) => {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {

      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickOutside();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [ref, onClickOutside]);
}
