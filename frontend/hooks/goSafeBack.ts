import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function useSafeBack(fallbackPath = "/") {
  const router = useRouter();

  const safeBack = useCallback(() => {
    const referrer = document.referrer;
    const cameFromOutside =
      referrer === "" || new URL(referrer).origin !== window.location.origin;

    if (cameFromOutside && window.history.length <= 1) {
      router.push(fallbackPath);
    } else {
      router.back();
    }
  }, [router, fallbackPath]);

  return safeBack;
}
