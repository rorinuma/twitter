"use client";

import { FaXTwitter } from "react-icons/fa6";
import NavLink from "./NavLink";
import { GoHome, GoHomeFill } from "react-icons/go";
import {
  IoIosMore,
  IoIosNotifications,
  IoIosNotificationsOutline,
} from "react-icons/io";
import { MdMailOutline, MdMail } from "react-icons/md";
import {
  IoPerson,
  IoPersonOutline,
  IoSearch,
  IoSearchOutline,
} from "react-icons/io5";
import Link from "next/link";
import avatarImage from "@/public/Type.jpg";
import { BsFeather } from "react-icons/bs";
import Avatar from "../user/Avatar";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useClickOutside } from "@/hooks/clickOutside";
import { useCloseOnInteraction } from "@/hooks/modalClose";

export default function Nav() {
  const router = useRouter();
  const { user } = useAuth();
  const [isOptionsOpen, setIsOptionsOpen] = useState<boolean>(false);
  const optionsRef = useRef<HTMLDivElement>(null);
  const optionsButtonRef = useRef<HTMLButtonElement>(null);

  const clickOutside = () => {
    setIsOptionsOpen((prev) => !prev);
  };

  useClickOutside([optionsRef, optionsButtonRef], () => {
    if (isOptionsOpen) clickOutside();
  });

  useCloseOnInteraction(
    isOptionsOpen,
    () => {
      setIsOptionsOpen(false);
    },
    {
      breakpoint: 499,
      moreThan: false,
    },
  );

  const handleAvatarClick = () => {
    setIsOptionsOpen((prev) => !prev);
  };

  const handleLogoutClick = () => {
    router.push("/signout");
  };

  return (
    <nav className="hidden xs:flex flex-col justify-between sticky top-0 flex-1/12 xl:flex-2/12 grow-0 shrink-0 max-h-dvh">
      {user && (
        <>
          <div className="flex xl:items-start items-center flex-col xl:mr-8 mt-0.5">
            <Link
              className="hover:bg-nav-hover p-3 rounded-full max-w-fit duration-(--hover-duration)"
              href="/home"
            >
              <FaXTwitter className="size-7" />
            </Link>
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
            />{" "}
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
            <NavLink
              icon={<IoPersonOutline className="size-7" />}
              pathMatchesIcon={<IoPerson className="size-7" />}
              text="Profile"
              href={user?.username}
              hrefs={[
                `/${user.username}/likes`,
                `/${user.username}/with_replies`,
              ]}
            />
            <button
              className="bg-button hover:bg-button-hover text-center font-semibold duration-(--hover-duration) rounded-full text-foreground-alt p-4 mt-2 w-fit xl:w-full"
              onClick={() => router.push("/compose/post")}
            >
              <div className="xl:block hidden">Post</div>
              <BsFeather className="xl:hidden block size-7" />
            </button>
          </div>
          <div className="flex flex-col relative">
            <button
              className="flex justify-between items-center  max-w-xs px-3 py-3 xl:mr-2 hover:bg-nav-hover duration-(--hover-duration) rounded-full mb-2"
              onClick={handleAvatarClick}
              ref={optionsButtonRef}
            >
              <div className="flex gap-3 items-center">
                <div>
                  <Avatar image={user?.avatarURL || avatarImage} />
                </div>
                <div className="xl:flex hidden flex-col text-left">
                  <div>{user?.displayName}</div>
                  <div className="text-muted">@{user?.username}</div>
                </div>
              </div>
              <IoIosMore className="xl:block hidden size-4" />
            </button>
            {isOptionsOpen && (
              <div
                className="absolute shadow-default rounded-2xl w-[300px] h-[72px] bg-background z-20 bottom-[125%] xl:left-1/2 xl:-translate-x-1/2 left-2"
                ref={optionsRef}
              >
                <div className="flex flex-col justify-center relative w-full h-full">
                  <div
                    className="p-3 hover:cursor-pointer hover:bg-nav-hover duration-(--hover-duration)"
                    onClick={handleLogoutClick}
                  >
                    Log out @{user?.username}
                  </div>
                  <div className="absolute -bottom-4 xl:left-1/2 xl:-translate-x-1/2 left-4 w-0 h-0 border-x-transparent border-b-transparent border-x-8 border-b-8 border-t-8 border-t-background"></div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </nav>
  );
}
