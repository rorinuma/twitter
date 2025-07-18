import { FaArrowLeft } from "react-icons/fa6";
import GeneralTooltip from "../decorations/GeneralTooltip";

export default function ArrowButton() {
  return (
    <GeneralTooltip content="Back">
      <button className="flex items-center">
        <FaArrowLeft className="size-9 p-2 hover:bg-nav-hover duration-(--hover-duration) rounded-full" />
      </button>
    </GeneralTooltip>
  );
}
