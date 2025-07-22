import { GoHome, GoHomeFill } from "react-icons/go";
import { IoSearch, IoSearchOutline } from "react-icons/io5";
import { MdMail, MdMailOutline } from "react-icons/md";
import { IoIosNotifications, IoIosNotificationsOutline } from "react-icons/io";
import NavLink from "../../layout/NavLink";
import MobileNavPost from "./MobileNavPost";

export default function MobileNav() {
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
      <NavLink
        icon={<IoIosNotificationsOutline className="size-7" />}
        pathMatchesIcon={<IoIosNotifications className="size-7" />}
        text="Notifications"
        href="notifications"
      />
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
