import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

interface Props
  extends DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  icon?: React.ReactNode;
  text?: string;
}

export default function IconButton({ onClick, icon, text }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center hover:bg-nav-hover duration-(--hover-duration) p-2 rounded-full "
    >
      {icon ? icon : text}
    </button>
  );
}
