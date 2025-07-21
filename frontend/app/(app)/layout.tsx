import Nav from "@/components/ui/layout/Nav";
import Sidebar from "@/components/ui/layout/Sidebar";
import MobileNav from "@/components/ui/mobile/nav/MobileNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex lg:w-4/5 grow shrink lg:grow-0 lg:shrink-0 justify-center">
      <Nav />
      <div className="flex flex-col shrink grow lg:shrink-0 lg:grow-0 lg:w-1/2 border-border border-x border-t min-h-dvh">
        {children}
        <MobileNav />
      </div>
      <Sidebar />
    </div>
  );
}
