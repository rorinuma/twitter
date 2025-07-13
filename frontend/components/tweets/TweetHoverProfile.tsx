"use client";

import { TweetHoverProfileProps } from "@/types/tweets.types";
import Avatar from "../ui/user/Avatar";
import clsx from "clsx";
import image from "@/public/Type.jpg";

export default function TweetHoverProfile({
  tweet,
  variant,
  refs,
  getFloatingProps,
  floatingStyles,
  open,
}: TweetHoverProfileProps) {
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
          <Avatar
            height={60}
            width={60}
            image={tweet.user.avatarURL || image}
          />
          <button className="flex bg-foreground text-foreground-alt font-medium h-fit py-2 px-3 rounded-full hover:opacity-80 duration-(--hover-duration)">
            Follow
          </button>
        </div>
        <div className="mt-1">
          <div className="font-semibold">{tweet.user.displayName}</div>
          <div className="text-sm text-muted">@{tweet.user.username}</div>
        </div>
        {tweet.user.bio && <p className="mt-6 text-sm">{tweet.user.bio}</p>}
        <div className="flex gap-2 text-sm">
          <div className="flex gap-1">
            <span>{tweet.user.following.length || 0}</span>
            <span className="text-muted font-light">Following</span>
          </div>
          <div className="flex gap-1">
            <span>{tweet.user.followers.length || 0}</span>
            <span className="text-muted font-light">Followers</span>
          </div>
        </div>
      </div>
    </div>
  );
}
