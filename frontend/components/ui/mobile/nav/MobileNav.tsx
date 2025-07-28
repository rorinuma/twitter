"use client";

import { GoHome, GoHomeFill } from "react-icons/go";
import { IoSearch, IoSearchOutline } from "react-icons/io5";
import { MdMail, MdMailOutline } from "react-icons/md";
import { IoIosNotifications, IoIosNotificationsOutline } from "react-icons/io";
import NavLink from "../../layout/NavLink";
import MobileNavPost from "./MobileNavPost";
import { useLiveUpdates } from "@/context/LiveUpdatesContext";

export default function MobileNav() {
  const { notificationCount } = useLiveUpdates();

  return (
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
  );
}
