import { FaXTwitter } from "react-icons/fa6";
import HeaderLink from "./HeaderLink";
import { GoHome, GoHomeFill } from "react-icons/go";
import {
  IoIosMore,
  IoIosNotifications,
  IoIosNotificationsOutline,
} from "react-icons/io";
import { MdMailOutline, MdMail } from "react-icons/md";
import { IoSearch, IoSearchOutline } from "react-icons/io5";
import Link from "next/link";
import Avatar from "@/app/components/Avatar";
import AvatarImage from "@/public/Type.jpg";
import { BsFeather } from "react-icons/bs";

export default function Header() {
  return (
    <header className="hidden xs:flex flex-col justify-between sticky top-0 flex-1/12 xl:flex-2/12 grow-0 shrink-0 max-h-dvh">
      <div className="flex xl:items-start items-center flex-col xl:mr-8 mt-0.5">
        <Link
          className="hover:bg-nav-hover p-3 rounded-full max-w-fit duration-(--hover-duration)"
          href="home"
        >
          <FaXTwitter className="size-7" />
        </Link>
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
        />{" "}
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
        <Link
          href="/compose/post"
          className="bg-button hover:bg-button-hover text-center duration-(--hover-duration) rounded-full text-foreground-alt p-3 mt-2 w-fit xl:w-full"
        >
          <div className="xl:block hidden">Post</div>
          <BsFeather className="xl:hidden block size-7" />
        </Link>
      </div>
      <button className="flex justify-between items-center max-w-xs px-3 py-2 xl:mr-2 hover:bg-nav-hover duration-(--hover-duration) rounded-full mb-2">
        <div className="flex gap-3 items-center">
          <div>
            <Avatar image={AvatarImage} />
          </div>
          <div className="xl:flex hidden flex-col text-left">
            <div>username</div>
            <div className="text-muted">@atUsername</div>
          </div>
        </div>
        <IoIosMore className="xl:block hidden size-7" />
      </button>
    </header>
  );
}
