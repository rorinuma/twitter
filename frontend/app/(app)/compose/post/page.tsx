import HomeLayout from "../../(home)/layout";
import Home from "@/app/(app)/(home)/home/page";
import PostModal from "../../@modals/(.compose)/post/page";

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
