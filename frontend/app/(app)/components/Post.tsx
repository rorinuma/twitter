"use client";

import Avatar from "@/app/components/Avatar";
import PostActions from "./PostActions";
import avatarImage from "@/public/Type.jpg";
import TextareaAutosize from "react-textarea-autosize";
import clsx from "clsx";
import { useEffect, useState } from "react";

interface Props {
  replyTo?: number;
  modal: boolean;
}

export enum ReplyPermissionType {
  Everyone = "everyone",
  Followed = "followed",
  Verified = "verified",
  Mentioned = "mentioned",
}

export type ReplyPermission =
  | ReplyPermissionType.Everyone
  | ReplyPermissionType.Followed
  | ReplyPermissionType.Verified
  | { type: ReplyPermissionType.Mentioned; mentions: string[] };

export default function Post({ replyTo, modal }: Props) {
  const [replyPermission, setReplyPermission] = useState<ReplyPermission>(
    ReplyPermissionType.Everyone,
  );
  let placeholder = "What's happening?!";
  if (replyTo) placeholder = "Post your reply";

  useEffect(() => {
    if (modal) {
      document.body.style.overflowY = "hidden";
    }

    return () => {
      document.body.style.overflowY = "";
    };
  }, []);

  return (
    <form
      className={clsx(`hidden xs:flex flex-col justify-between bg-black`, {
        "border-b border-b-border z-0": !modal,
        "rounded-xl z-30 w-96 h-72": modal,
      })}
    >
      <div className="flex gap-2 m-2">
        <Avatar image={avatarImage} />
        <div className="flex flex-col mt-2 grow-1 shrink-1">
          <TextareaAutosize
            placeholder={placeholder}
            className="flex outline-none min-h-8 resize-none"
          />
        </div>
      </div>
      {/* actions */}
      <PostActions
        replyTo={replyTo}
        modal={modal}
        replyPermission={replyPermission}
        setReplyPermission={setReplyPermission}
      />
    </form>
  );
}
