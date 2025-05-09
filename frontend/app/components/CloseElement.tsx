"use client";

import { IoMdClose } from "react-icons/io";
import IconButton from "./IconButton";
import { useSafeBack } from "../hooks/goSafeBack";

interface Props {
  centeredNode: React.ReactNode;
  backHref: string;
}
export default function CloseElement({ centeredNode, backHref }: Props) {
  const safeBack = useSafeBack(backHref);

  return (
    <div className="relative flex justify-center items-center w-full h-[53px]">
      <div className="absolute top-1 left-1">
        <IconButton
          icon={<IoMdClose className="size-5" onClick={safeBack} />}
          bg="transparent"
        />
      </div>
      {centeredNode}
    </div>
  );
}
