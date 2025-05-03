import clsx from "clsx";
import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

interface Props
  extends DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  bg: "blue" | "transparent";
  text: string;
}

export default function SmallButton({ bg, text, disabled }: Props) {
  return (
    <button
      className={clsx(
        "flex items-center justify-center px-3.5 py-1.5 rounded-full",
        {
          "bg-blue disabled:opacity-50 text-white font-bold text-sm":
            bg === "blue",
        },
      )}
      type="button"
      disabled={disabled}
    >
      {text}
    </button>
  );
}
