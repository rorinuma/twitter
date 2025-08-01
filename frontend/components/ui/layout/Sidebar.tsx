"use client";

import Search from "@/components/search/Search";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <section className="hidden lg:flex sticky top-1 max-h-dvh flex-1/2 ml-6 mt-2">
      {user ? (
        <div className="flex flex-col gap-2 w-full">
          <Search />
        </div>
      ) : (
        <div className="flex flex-col gap-2 rounded-2xl p-2 border border-border h-fit">
          <div className="font-bold text-xl">New To X?</div>
          <div className="font-light text-sm text-muted">
            Sign up now to get your own personalized (not) timeline!
          </div>
          <button
            className="p-2 text-foreground-alt bg-foreground hover:opacity-90 duration-(--hover-duration) rounded-full mt-1"
            onClick={() => router.push("/signup")}
          >
            Create account
          </button>
          <button
            className="p-2 bg-blue font-bold hover:opacity-90 duration-(--hover-duration) rounded-full mt-1"
            onClick={() => router.push("/signin")}
          >
            Login
          </button>
        </div>
      )}
    </section>
  );
}
