"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  icon: React.ReactNode;
  pathMatchesIcon: React.ReactNode;
  text: string;
  href: string;
  hrefs?: string[];
}

export default function NavLink({
  icon,
  text,
  href,
  hrefs,
  pathMatchesIcon,
}: Props) {
  const pathname = usePathname();

  return (
    <Link
      href={`/${href}`}
      className="flex p-3 items-center justify-center outline-none hover:bg-nav-hover duration-(--hover-duration) rounded-full max-w-fit"
    >
      {pathname === `/${href}` || hrefs?.some((ref) => pathname === ref)
        ? pathMatchesIcon
        : icon}
      <div className="xl:flex hidden items-center mr-4 ml-3 text-xl font-bold text-center">
        {text}
      </div>
    </Link>
  );
}
