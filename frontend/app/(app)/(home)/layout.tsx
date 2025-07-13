import Post from "@/components/post/Post";
import MainHeader from "@/components/ui/layout/MainHeader";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "X",
  description: "X timeline",
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MainHeader
        items={[
          { item: "For you", path: "home" },
          { item: "Following", path: "following" },
        ]}
      />
      <Post modal={false} />
      {children}
    </>
  );
}
