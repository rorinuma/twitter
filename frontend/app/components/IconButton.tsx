import clsx from "clsx";
import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

interface Props
  extends DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  icon?: React.ReactNode;
  text?: string;
  bg: "transparent" | "blurred";
}

export default function IconButton({ onClick, icon, text, bg }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "flex items-center justify-center hover:bg-nav-hover duration-(--hover-duration) p-2 rounded-full ",
        {
          "backdrop-blur-xs bg-transparent-blurred hover:bg-transparent-blurred-hover":
            bg === "blurred",
        },
      )}
    >
      {icon ? icon : text}
    </button>
  );
}
