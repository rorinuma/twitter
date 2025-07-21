"use client";

import { FaArrowLeft } from "react-icons/fa6";
import GeneralTooltip from "../decorations/GeneralTooltip";
import { useSafeBack } from "@/hooks/goSafeBack";
import { useAuth } from "@/context/authContext";

interface Props {
  setImageSrc?: React.Dispatch<React.SetStateAction<string>>;
}

export default function ArrowButton({ setImageSrc }: Props) {
  const { user } = useAuth();
  const handleGoBack = () => {
    if (!setImageSrc) {
      return safeBack();
    }
    return setImageSrc("");
  };
  const safeBack = useSafeBack(!!user ? "/home" : "/");

  return (
    <GeneralTooltip content="Back">
      <button className="flex items-center" onClick={handleGoBack}>
        <FaArrowLeft className="size-9 p-2 hover:bg-nav-hover duration-(--hover-duration) rounded-full" />
      </button>
    </GeneralTooltip>
  );
}
