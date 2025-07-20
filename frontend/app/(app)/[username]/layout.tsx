"use client";

import ArrowButton from "@/components/ui/buttons/ArrowButton";
import GeneralTooltip from "@/components/ui/decorations/GeneralTooltip";
import Spinner from "@/components/ui/decorations/Spinner";
import { useAuth } from "@/context/authContext";
import { getUserByUsername } from "@/lib/queries/user.queries";
import { User } from "@/types/user.types";
import Image from "next/image";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import defaultAvatar from "@/public/placeholder.jpg";
import { formatDateProfile } from "@/lib/dates";
import { PiCalendarDotsLight } from "react-icons/pi";
import Link from "next/link";
import MainHeaderItem from "@/components/ui/layout/MainHeaderItem";
import { OwnerContext } from "@/context/OwnerContext";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [owner, setOwner] = useState<User | undefined>(undefined);
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchOwner = async (username: string) => {
      try {
        const user = await getUserByUsername(username);
        if (!user) notFound();
        setOwner(user);
      } catch (err) {
        console.error("Error while trying to fetch profile owner", err);
        notFound();
      } finally {
        setIsLoading(false);
      }
    };
    fetchOwner(username);
  }, [username]);

  const items =
    owner?.id === user?.id
      ? [
          { item: "Posts", path: `${[user?.username]}` },
          { item: "Replies", path: `${[user?.username]}/with_replies` },
          { item: "Likes", path: `${[user?.username]}/likes` },
        ]
      : [
          { item: "Posts", path: `${[owner?.username]}` },
          { item: "Replies", path: `${[owner?.username]}/with-replies` },
        ];

  const displayedItems = items.map(({ item, path }, index) => (
    <MainHeaderItem item={item} path={path} key={index} />
  ));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full h-dvh ">
        <Spinner />
      </div>
    );
  }

  return (
    owner &&
    !isLoading && (
      <>
        <div className="flex flex-col relative w-full h-full">
          <header className="sticky top-0 flex justify-between backface-visible h-14 backdrop-blur-md z-10 p-1 border-b border-b-border">
            <div className="flex items-center">
              <div>
                <ArrowButton />
              </div>
              <div className="flex flex-col ml-5">
                <div>{owner.displayName}</div>
              </div>
            </div>
            <div className="flex items-center">
              <GeneralTooltip content="Search">
                <button className="flex items-center">
                  <IoSearchOutline className="size-9 p-2 hover:bg-nav-hover duration-(--hover-duration) rounded-full" />
                </button>
              </GeneralTooltip>
            </div>
          </header>
          <div className="flex grow shrink max-h-[200px] bg-white">
            {owner.bannerURL && (
              <Image
                src={owner.bannerURL}
                height={200}
                width={500}
                alt="banner-image"
                className="object-contain"
              />
            )}
          </div>
          <div className="flex justify-between p-2 mx-2 h-[100px]">
            <div className="relative w-1/5">
              <Image
                src={owner.avatarURL ?? defaultAvatar}
                height={145}
                width={145}
                alt="avatar-image"
                className="absolute bottom-5 object-contain rounded-full w-[145px] h-[145px]"
              />
            </div>
            {user?.id === owner.id ? (
              <button
                className="flex h-fit border py-2 px-4 font-bold border-border-muted rounded-full hover:bg-nav-hover duration-(--hover-duration)"
                onClick={() => router.push("/settings/profile")}
              >
                Edit profile
              </button>
            ) : (
              <button className="flex h-fit border py-2 px-4 bg-foreground text-foreground-alt font-bold rounded-full hover:opacity-90 duration-(--hover-duration)">
                Follow
              </button>
            )}
          </div>
          <div className="flex flex-col mx-3">
            <div className="text-xl font-bold">{owner.displayName}</div>
            <div className="text-sm text-muted font-light">
              @{owner.displayName}
            </div>
            <div className="flex gap-1 items-center text-muted mt-2">
              <PiCalendarDotsLight />
              <span>Joined {formatDateProfile(owner.createdAt)}</span>
            </div>
            <div className="flex gap-3 items-center mt-2">
              <Link
                href={`/${owner.username}/following`}
                className="flex text-sm gap-1 hover:underline"
              >
                <span className="font-bold">{owner.following.length}</span>
                <span className="text-muted font-light">Following</span>
              </Link>
              <Link
                href={`/${owner.username}/followers`}
                className="flex text-sm gap-1 hover:underline"
              >
                <span className="font-bold">{owner.followers.length}</span>
                <span className="text-muted font-light">Followers</span>
              </Link>
            </div>
          </div>
          <div className="flex mt-2 text-lg h-[60px] border-b border-b-border">
            {displayedItems}
          </div>
          <OwnerContext.Provider value={owner}>
            {children}
          </OwnerContext.Provider>
        </div>
      </>
    )
  );
}
