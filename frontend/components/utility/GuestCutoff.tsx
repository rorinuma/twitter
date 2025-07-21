"use client";

import { IoMdClose } from "react-icons/io";
import BlueOverlay from "../shared/overlays/BlueOverlay";
import { useRouter } from "next/navigation";

interface Props {
  icon: React.ReactNode;
  mainText: string;
  secondaryText: string;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function GuestCutoff({
  icon,
  mainText,
  secondaryText,
  setIsVisible,
}: Props) {
  const router = useRouter();

  return (
    <BlueOverlay centered>
      <section className="flex flex-col bg-background rounded-2xl p-2">
        <button
          className="p-2 rounded-full w-fit hover:bg-nav-hover duration-(--hover-duration)"
          onClick={() => setIsVisible(false)}
        >
          <IoMdClose className="size-6" />
        </button>
        <div className="flex flex-col max-xs:w-full xs:px-20 xs:max-w-[496px]">
          <div className="mb-10 mt-6 mx-auto">{icon}</div>
          <div className="text-2xl font-bold">{mainText}</div>
          <div className="text-muted font-light">{secondaryText}</div>
          <button
            className="flex items-center justify-center mt-8 font-bold text-foreground bg-blue hover:opacity-90 duration-(--hover-duration) rounded-full p-4"
            onClick={() => router.push("/signin")}
          >
            Log in
          </button>
          <button
            className="flex items-center justify-center mt-2 mb-16 font-bold text-blue border border-border-muted hover:opacity-90 duration-(--hover-duration) rounded-full p-4"
            onClick={() => router.push("/signup")}
          >
            Sign up
          </button>
        </div>
      </section>
    </BlueOverlay>
  );
}
