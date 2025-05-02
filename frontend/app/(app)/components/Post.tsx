"use client";

import Avatar from "@/app/components/Avatar";
import PostActions from "./PostActions";
import avatarImage from "@/public/Type.jpg";
import TextareaAutosize from "react-textarea-autosize";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import IconButton from "@/app/components/IconButton";
import { useRouter } from "next/navigation";
import { useSafeBack } from "@/app/utils/goSafeBack";

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
  | { type: ReplyPermissionType.Everyone }
  | { type: ReplyPermissionType.Followed }
  | { type: ReplyPermissionType.Verified }
  | { type: ReplyPermissionType.Mentioned; mentions: string[] };

export default function Post({ replyTo, modal }: Props) {
  const [replyPermission, setReplyPermission] = useState<ReplyPermission>({
    type: ReplyPermissionType.Everyone,
  });
  const [isPostDisabled, setIsPostDisabled] = useState<boolean>(true);
  const [files, setFiles] = useState<FileList | null>(null);
  const safeBack = useSafeBack();

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
      className={clsx(`flex flex-col bg-black`, {
        "border-b border-b-border z-0": !modal,
        "rounded-2xl z-30 w-full max-w-[600px] min-h-[269px] grow shrink fixed top-0 xs:top-1/12":
          modal,
      })}
    >
      {modal && (
        <div className="flex content-between h-[53px] bg-background rounded-2xl p-2">
          <div>
            <IconButton
              icon={<IoMdClose className="size-5" onClick={safeBack} />}
            />
          </div>
          <div></div>
        </div>
      )}
      <div className="flex flex-col shrink grow justify-between">
        <div className="flex gap-2 m-3">
          <Avatar image={avatarImage} />
          <div className="flex flex-col mt-3 grow shrink">
            <TextareaAutosize
              placeholder={placeholder}
              className="flex outline-none min-h-8 resize-none"
              maxLength={501}
              maxRows={15}
            />
          </div>
        </div>
        {/* actions */}
        <PostActions
          replyTo={replyTo}
          modal={modal}
          isPostDisabled={isPostDisabled}
          replyPermission={replyPermission}
          setReplyPermission={setReplyPermission}
          files={files}
          setFiles={setFiles}
        />
      </div>
    </form>
  );
}
