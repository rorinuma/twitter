import Post from "@/components/post/Post";
import MainHeader from "@/components/ui/layout/MainHeader";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MainHeader
        items={[
          { item: "For you", path: "/home" },
          { item: "Following", path: "/following" },
        ]}
      />
      <Post modal={false} />
      {children}
    </>
  );
}
