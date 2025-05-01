import MainHeader from "../components/MainHeader";
import Post from "../components/Post";

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
      <div>{children}</div>
    </>
  );
}
