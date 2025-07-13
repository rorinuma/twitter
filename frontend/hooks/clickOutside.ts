import { useEffect } from "react";

export const useClickOutside = (
  refs: React.RefObject<HTMLElement | null>[],
  onClickOutside: () => void,
) => {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const isInside = refs.some((ref) =>
        ref.current?.contains(event.target as Node),
      );

      if (!isInside) {
        onClickOutside();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [refs, onClickOutside]);
};
