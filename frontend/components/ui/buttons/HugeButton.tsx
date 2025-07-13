import clsx from "clsx";
import Link from "next/link";

interface Props {
  text?: string;
  href: string;
  icon?: React.ReactNode;
  bg: "blue" | "default" | "transparent";
}

export default function HugeButton({ text, href, icon, bg }: Props) {
  return (
    <Link
      href={href}
      className={clsx(
        "flex items-center justify-center w-full rounded-full duration-(--hover-duration) p-2.5 font-bold",
        {
          "bg-blue hover:opacity-90 text-foreground": bg === "blue",
          "bg-transparent hover:bg-blue-hover text-blue border border-border-muted":
            bg === "transparent",
        },
      )}
    >
      {text || icon}
    </Link>
  );
}
