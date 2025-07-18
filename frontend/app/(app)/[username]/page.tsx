"use client";

import ArrowButton from "@/components/ui/buttons/ArrowButton";
import GeneralTooltip from "@/components/ui/decorations/GeneralTooltip";
import Spinner from "@/components/ui/decorations/Spinner";
import { useAuth } from "@/context/authContext";
import { getUserByUsername } from "@/lib/queries/user.queries";
import { User } from "@/types/user.types";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";

export default function UserProfile() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [owner, setOwner] = useState<User | undefined>(undefined);
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();

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
        <div>{owner?.username}</div>
      </div>
    )
  );
}
