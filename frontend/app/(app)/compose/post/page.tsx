"use client";

import PostModal from "@/app/@modals/(.)compose/post/page";
import HomeLayout from "../../(home)/layout";
import Home from "@/app/(app)/(home)/home/page";

// i don't think that's how you do it...
export default function PostFallback() {
  return (
    <>
      <HomeLayout>
        <Home />
      </HomeLayout>
      <PostModal />
    </>
  );
}
