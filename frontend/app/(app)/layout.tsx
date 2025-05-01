import Header from "./components/Header";
import MobileHeader from "./components/MobileHeader";
import Sidebar from "./components/Sidebar";

export default function AppLayout({
  children,
  modals,
}: {
  children: React.ReactNode;
  modals: React.ReactNode;
}) {
  return (
    <div className="flex justify-items-center lg:flex-4/5 grow shrink lg:grow-0 lg:shrink-0 ">
      <Header />
      <div className="relative flex flex-col shrink grow lg:shrink-0 lg:grow-0 lg:flex-1/2 border-border border-x border-t min-h-20000">
        {children}
        {modals}
        <MobileHeader />
      </div>
      <Sidebar />
    </div>
  );
}
