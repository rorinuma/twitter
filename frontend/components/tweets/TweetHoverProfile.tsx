"use client";

import { TweetHoverProfileProps } from "@/types/.types";
import Avatar from "../ui/user/Avatar";
import clsx from "clsx";
import image from "@/public/placeholder.jpg";
import FollowButton from "../ui/buttons/FollowButton";
import { useAuth } from "@/context/authContext";

export default function TweetHoverProfile({
  user,
  variant,
  refs,
  getFloatingProps,
  floatingStyles,
  open,
}: TweetHoverProfileProps) {
  const { user: currentUser, setUser } = useAuth();

  return (
    <div
      ref={(node) => {
        if (variant !== "compose-reply") {
          refs.setFloating(node);
        }
      }}
      onClick={(e) => e.stopPropagation()}
      style={floatingStyles}
      {...getFloatingProps()}
      className={clsx(
        "bg-background shadow-default p-4 rounded-2xl w-64 transition-opacity duration-300 z-10",
        {
          "pointer-events-auto": open,
          "hidden pointer-events-none": !open,
        },
      )}
    >
      <div className="flex flex-col">
        <div className="flex justify-between w-full">
          <Avatar height={60} width={60} image={user.avatarURL || image} />
          {user.id !== user?.id && (
            <FollowButton
              user={user}
              currentUser={user}
              setCurrentUser={setUser}
            />
          )}
        </div>
        <div className="mt-1">
          <div className="font-semibold">{user.displayName}</div>
          <div className="text-sm text-muted">@{user.username}</div>
        </div>
        {user.bio && <p className="mt-6 text-sm">{user.bio}</p>}
        <div className="flex gap-2 text-sm">
          <div className="flex gap-1">
            <span>{user.following.length || 0}</span>
            <span className="text-muted font-light">Following</span>
          </div>
          <div className="flex gap-1">
            <span>{user.followers.length || 0}</span>
            <span className="text-muted font-light">Followers</span>
          </div>
        </div>
      </div>
    </div>
  );
}
