"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";


interface Props {
  icon: React.ReactNode;
  pathMatchesIcon: React.ReactNode;
  text: string;
  href: string;
  // secondHref if the icon has active status on an additional route
  secondHref?: string;
}

export default function HeaderLink({ icon, text, href, secondHref, pathMatchesIcon }: Props) {
  const pathname = usePathname();

  return (
    <Link href={href} className="flex p-2 items-center justify-items-center outline-none hover:bg-nav-hover duration-(--hover-duration) rounded-full max-w-fit">
      {pathname === `/${href}` || secondHref ? pathMatchesIcon : icon}
      <div className="xl:flex hidden items-center mr-4 ml-3 text-xl font-bold text-center">{text}</div>
    </Link>
  )
}
