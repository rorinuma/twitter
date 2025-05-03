"use client";

import Avatar from "@/app/components/Avatar";
import PostActions from "./PostActions";
import avatarImage from "@/public/Type.jpg";
import TextareaAutosize from "react-textarea-autosize";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { IoMdClose } from "react-icons/io";
import IconButton from "@/app/components/IconButton";
import { useSafeBack } from "@/app/hooks/goSafeBack";
import { ReplyPermission, ReplyPermissionType } from "@/app/types/postTypes";
import SmallButton from "@/app/components/SmallButton";

interface Props {
  replyTo?: number;
  modal: boolean;
  ref?: React.RefObject<HTMLFormElement | null>;
}

export default function Post({ replyTo, modal, ref }: Props) {
  const [replyPermission, setReplyPermission] = useState<ReplyPermission>({
    type: ReplyPermissionType.Everyone,
  });
  const [text, setText] = useState<string>("");
  const [files, setFiles] = useState<FileList | null>(null);
  const safeBack = useSafeBack();

  const isDisabled = useMemo(() => {
    return text.trim().length === 0 && !files?.length;
  }, [text, files]);

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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
  };

  return (
    <form
      className={clsx(`flex-col bg-black`, {
        "hidden xs:flex border-b border-b-border z-0": !modal,
        "flex rounded-2xl z-30 w-full max-w-[600px] min-h-[269px] grow shrink fixed top-0 xs:top-1/12":
          modal,
      })}
      ref={ref}
      onSubmit={handleSubmit}
    >
      {modal && (
        <div className="flex justify-between h-[53px] bg-background rounded-2xl p-2">
          <div>
            <IconButton
              icon={<IoMdClose className="size-5" onClick={safeBack} />}
            />
          </div>
          <div className="flex items-center xs:hidden">
            <SmallButton bg="blue" text="Post" disabled={isDisabled} />
          </div>
        </div>
      )}

      <div className="flex flex-col shrink grow justify-between">
        <div className="flex gap-2 m-3">
          <Avatar image={avatarImage} />
          <div className="flex flex-col mt-3 grow shrink">
            <TextareaAutosize
              placeholder={placeholder}
              className="flex outline-none min-h-8 resize-none"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={500}
              maxRows={15}
            />
          </div>
        </div>

        <PostActions
          replyTo={replyTo}
          modal={modal}
          isPostDisabled={isDisabled}
          replyPermission={replyPermission}
          setReplyPermission={setReplyPermission}
          files={files}
          setFiles={setFiles}
        />
      </div>
    </form>
  );
}
