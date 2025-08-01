"use client";

import { GoHome, GoHomeFill } from "react-icons/go";
import { IoSearch, IoSearchOutline } from "react-icons/io5";
import { MdMail, MdMailOutline } from "react-icons/md";
import { IoIosNotifications, IoIosNotificationsOutline } from "react-icons/io";
import NavLink from "../../layout/NavLink";
import MobileNavPost from "./MobileNavPost";
import { useLiveUpdates } from "@/context/LiveUpdatesContext";
import { useAuth } from "@/context/authContext";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

export default function MobileNav() {
  const { notificationCount } = useLiveUpdates();
  const { user } = useAuth();
  const router = useRouter();

  return user ? (
    <div className="flex xs:hidden fixed items-center justify-around w-full h-14 bottom-0 shrink grow border-t-border border-t ">
      <NavLink
        icon={<GoHome className="size-7" />}
        pathMatchesIcon={<GoHomeFill className="size-7" />}
        text="Home"
        href="home"
        hrefs={["/following"]}
      />
      <NavLink
        icon={<IoSearchOutline className="size-7" />}
        pathMatchesIcon={<IoSearch className="size-7" />}
        text="Explore"
        href="explore"
      />
      <div className="relative">
        <NavLink
          icon={<IoIosNotificationsOutline className="size-7" />}
          pathMatchesIcon={<IoIosNotifications className="size-7" />}
          text="Notifications"
          href="notifications"
        />
        {notificationCount !== 0 && (
          <div className="absolute left-6 top-1 py-0.5 px-2 rounded-full bg-blue ">
            {" "}
            {notificationCount}
          </div>
        )}
      </div>
      <NavLink
        icon={<MdMailOutline className="size-7" />}
        pathMatchesIcon={<MdMail className="size-7" />}
        text="Messages"
        href="messages"
      />
      <MobileNavPost />
    </div>
  ) : (
    createPortal(
      <div className="flex items-center justify-center fixed bottom-0 h-14 bg-blue w-full shadow-default">
        <div className="flex lg:justify-between w-[90%] lg:w-[60%] lg:h-full">
          <div className="hidden lg:flex flex-col justify-center">
            <div className="text-2xl font-bold">
              Don't miss what's happening
            </div>
            <div className="text-sm">People on X are the first to know.</div>
          </div>
          <div className="flex items-center gap-2 max-lg:w-full max-lg:justify-center">
            <button
              className="flex items-center justify-center w-[40%] lg:w-fit bg-inherit text-foreground border p-2 px-3 font-bold border-[rgba(255, 255, 255, 0.35)] hover:opacity-80 duration-(--hover-duration) rounded-full"
              onClick={() => router.push("/signin")}
            >
              Log in
            </button>
            <button
              className="flex items-center justify-center w-[40%] lg:w-fit bg-foreground text-foreground-alt p-2 px-3 hover:opacity-90 duration-(--hover-duration) rounded-full"
              onClick={() => router.push("/signup")}
            >
              Sign up
            </button>
          </div>
        </div>
      </div>,
      document.body,
    )
  );
}
