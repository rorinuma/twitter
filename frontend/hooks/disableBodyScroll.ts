import { useEffect } from "react";

export const useDisableBodyScroll = (condition: boolean = true) => {
  useEffect(() => {
    if (condition) {
      document.body.style.overflowY = "hidden";
    }

    return () => {
      if (condition) {
        document.body.style.overflowY = "";
      }
    };
  }, [condition]);
};
