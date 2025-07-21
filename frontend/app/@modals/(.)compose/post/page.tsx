"use client";

import Post from "@/components/post/Post";
import BlueOverlay from "@/components/shared/overlays/BlueOverlay";
import { useClickOutside } from "@/hooks/clickOutside";
import { useSafeBack } from "@/hooks/goSafeBack";
import { useRef } from "react";

export default function PostModal() {
  const postModalRef = useRef<HTMLFormElement>(null);
  const safeBack = useSafeBack("/home");

  useClickOutside([postModalRef], () => {
    safeBack();
  });

  return (
    <BlueOverlay centered={true}>
      <Post ref={postModalRef} modal={true} />
    </BlueOverlay>
  );
}
