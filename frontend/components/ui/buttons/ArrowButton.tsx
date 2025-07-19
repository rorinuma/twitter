"use client";

import { FaArrowLeft } from "react-icons/fa6";
import GeneralTooltip from "../decorations/GeneralTooltip";
import { useSafeBack } from "@/hooks/goSafeBack";
import { useAuth } from "@/context/authContext";

export default function ArrowButton() {
  const { user } = useAuth();
  const safeBack = useSafeBack(!!user ? "/home" : "/");

  return (
    <GeneralTooltip content="Back">
      <button className="flex items-center" onClick={safeBack}>
        <FaArrowLeft className="size-9 p-2 hover:bg-nav-hover duration-(--hover-duration) rounded-full" />
      </button>
    </GeneralTooltip>
  );
}
