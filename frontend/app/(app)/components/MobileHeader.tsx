import { GoHome, GoHomeFill } from "react-icons/go";
import HeaderLink from "./HeaderLink";
import { IoSearch, IoSearchOutline } from "react-icons/io5";
import { MdMail, MdMailOutline } from "react-icons/md";
import { IoIosNotifications, IoIosNotificationsOutline } from "react-icons/io";
import { BsFeather } from "react-icons/bs";

export default function MobileHeader() {
  return (
    <div className="flex xs:hidden fixed items-center justify-around w-full h-14 bottom-0 shrink grow border-t-border border-t ">
      <HeaderLink
        icon={<GoHome className="size-7" />}
        pathMatchesIcon={<GoHomeFill className="size-7" />}
        text="Home"
        href="home"
        secondHref="following"
      />
      <HeaderLink
        icon={<IoSearchOutline className="size-7" />}
        pathMatchesIcon={<IoSearch className="size-7" />}
        text="Explore"
        href="explore"
      />
      <HeaderLink
        icon={<IoIosNotificationsOutline className="size-7" />}
        pathMatchesIcon={<IoIosNotifications className="size-7" />}
        text="Notifications"
        href="notifications"
      />
      <HeaderLink
        icon={<MdMailOutline className="size-7" />}
        pathMatchesIcon={<MdMail className="size-7" />}
        text="Messages"
        href="messages"
      />
      <button className="absolute right-7 bottom-20 bg-blue hover:bg-button-hover duration-(--hover-duration) rounded-full text-foreground p-4 w-fit xl:w-full">
        <BsFeather className="size-7" />
      </button>
    </div>
  );
}
