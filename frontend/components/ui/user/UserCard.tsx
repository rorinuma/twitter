"use client";

import { User } from "@/types/user.types";
import Avatar from "./Avatar";
import defaultImage from "@/public/placeholder.jpg";
import FollowButton from "../buttons/FollowButton";
import { useAuth } from "@/context/authContext";
import { IoPersonSharp } from "react-icons/io5";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { getUserByUsername } from "@/lib/queries/user.queries";

export default function UserCard({
  user,
  isSearch,
  lastRounded,
  username,
}: {
  user: User | null;
  isSearch: boolean;
  lastRounded?: boolean;
  username?: string;
}) {
  const router = useRouter();
  const { user: currentUser, setUser: setCurrentUser } = useAuth();

  const [displayedUser, setDisplayedUser] = useState<User | null>(user);

  useEffect(() => {
    if (!user && username) {
      const fetchUser = async () => {
        try {
          const fetchedUser = await getUserByUsername(username);
          setDisplayedUser(fetchedUser);
        } catch (err) {
          console.error("Error fetching user:", err);
        }
      };
      fetchUser();
    }
  }, [user, username]);

  if (!displayedUser) return null;

  const isFollowing = currentUser?.following.includes(displayedUser.username);

  return (
    <div
      className={clsx(
        "flex flex-col p-2 cursor-pointer hover:bg-nav-hover duration-(--hover-duration)",
        {
          "rounded-b-xl": lastRounded,
        },
      )}
      onClick={() => router.push(`/${displayedUser.username}`)}
    >
      <div className="flex justify-between">
        <div className="flex gap-1">
          <Avatar image={displayedUser.avatarURL ?? defaultImage} />
          <div className="flex flex-col">
            <div>{displayedUser.displayName}</div>
            <div className="text-muted font-light">
              @{displayedUser.username}
            </div>
            {isSearch && isFollowing && (
              <div className="flex gap-1 text-muted font-light items-center">
                <IoPersonSharp className="size-4" />
                <div>Following</div>
              </div>
            )}
          </div>
        </div>
        {!isSearch && (
          <FollowButton
            user={displayedUser}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
          />
        )}
      </div>
      {!isSearch && displayedUser.bio && <div>{displayedUser.bio}</div>}
    </div>
  );
}
