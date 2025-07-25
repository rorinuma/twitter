"use client";

import { User } from "@/types/user.types";
import Avatar from "./Avatar";
import defaultImage from "@/public/placeholder.jpg";
import FollowButton from "../buttons/FollowButton";
import { useAuth } from "@/context/authContext";
import { IoPersonSharp } from "react-icons/io5";
import { useRouter } from "next/navigation";
import clsx from "clsx";

export default function UserCard({
  user,
  isSearch,
  lastRounded,
}: {
  user: User | null;
  isSearch: boolean;
  lastRounded?: boolean;
}) {
  const router = useRouter();

  const { user: currentUser, setUser: setCurrentUser } = useAuth();
  const isFollowing = currentUser?.following.includes(user?.username ?? "");

  return (
    user && (
      <div
        className={clsx(
          "flex flex-col p-2 cursor-pointer hover:bg-nav-hover duration-(--hover-duration)",
          {
            "rounded-b-xl": lastRounded,
          },
        )}
        onClick={() => router.push(`/${user.username}`)}
      >
        <div className="flex justify-between">
          <div className="flex gap-1">
            <Avatar image={user.avatarURL ?? defaultImage} />
            <div className="flex flex-col">
              <div>{user.displayName}</div>
              <div className="text-muted font-light">@{user.username}</div>
              {isSearch && isFollowing && (
                <div className="flex gap-1 text-muted font-light items-center">
                  <div>{<IoPersonSharp className="size-4" />}</div>
                  <div>Following</div>
                </div>
              )}
            </div>
          </div>
          {!isSearch && (
            <FollowButton
              user={user}
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
            />
          )}
        </div>
        {!isSearch && user.bio && <div>{user.bio}</div>}
      </div>
    )
  );
}
