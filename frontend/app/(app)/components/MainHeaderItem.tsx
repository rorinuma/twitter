"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  item: string;
  path: string;
}
export default function MainHeaderItem({ item, path }: Props) {
  const pathname = usePathname();

  return (
    <Link href={path} className="flex min-w-1/5 grow-1 shrink-1 items-center justify-center relative hover:bg-nav-hover duration-(--hover-duration)">
      <span className={`${pathname === `/${path}` ? "text-inherit" : "text-muted"}`}>
        {item}
      </span>
      <span className={`${pathname === `/${path}` && "w-30 absolute h-1 bottom-0 bg-blue rounded-full"}`}></span>
    </Link>
  )
}
