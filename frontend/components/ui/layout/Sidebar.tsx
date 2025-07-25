import Search from "@/components/search/Search";

export default function Sidebar() {
  return (
    <section className="hidden lg:flex sticky top-1 max-h-dvh flex-1/2 ml-6 mt-2">
      <div className="flex flex-col gap-2 w-full">
        <Search />
      </div>
    </section>
  );
}
