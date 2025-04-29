import MainHeader from "../components/MainHeader";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MainHeader items={[{ item: "For you", path: "home" }, { item: "Following", path: "following" }]} />
      <div>
        {children}
      </div>
    </>
  )
}
