"use client";

import Post from "@/app/(app)/components/Post";
import BlueOverlay from "@/app/components/BlueOverlay";
import { useClickOutside } from "@/app/hooks/clickOutside";
import { useSafeBack } from "@/app/hooks/goSafeBack";
import { useRef } from "react";

export default function PostModal() {
  const postModalRef = useRef<HTMLFormElement>(null);
  const goBack = useSafeBack();

  useClickOutside(postModalRef, () => {
    goBack();
  });

  return (
    <BlueOverlay centered={true}>
      <Post ref={postModalRef} modal={true} />
    </BlueOverlay>
  );
}
