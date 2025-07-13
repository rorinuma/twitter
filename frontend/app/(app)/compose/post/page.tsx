import HomeLayout from "../../(home)/layout";
import Home from "@/app/(app)/(home)/home/page";
import PostModal from "../../@modals/(.)compose/post/page";

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
