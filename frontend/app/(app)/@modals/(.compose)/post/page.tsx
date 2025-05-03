"use client";

import Post from "@/app/(app)/components/Post";
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
    <div className="flex grow shrink fixed justify-center inset-0 z-20 bg-background xs:bg-blue-overlay">
      <Post ref={postModalRef} modal={true} />
    </div>
  );
}
