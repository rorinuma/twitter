"use client";

import { useRouter } from "next/navigation";
import { BsFeather } from "react-icons/bs";

export default function MobileHeaderPost() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push("compose/post")}
      className="absolute right-7 bottom-20 bg-blue hover:bg-button-hover duration-(--hover-duration) rounded-full text-foreground p-4 w-fit xl:w-full"
    >
      <BsFeather className="size-7" />
    </button>
  );
}
