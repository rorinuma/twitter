import BlueOverlay from "@/app/components/BlueOverlay";
import CloseElement from "@/app/components/CloseElement";
import { FaXTwitter } from "react-icons/fa6";

export default function SignUp() {
  return (
    <BlueOverlay>
      <div className="flex flex-col items-center  p-1 relative bg-black rounded-2xl z-30 min-h-[400px] md:max-h-[90vh] md:min-w-[600px] md:max-w-[80vw] md:h-[650px]">
        <CloseElement
          centeredNode={<FaXTwitter className="size-7" />}
          backHref="/"
        />
        <div className="flex flex-col px-20 border border-border">
          f[slfdp[lfs[pd
        </div>
        <div className="fixed "></div>
      </div>
    </BlueOverlay>
  );
}
