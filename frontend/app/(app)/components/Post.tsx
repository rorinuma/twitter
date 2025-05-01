"use client";

import Avatar from "@/app/components/Avatar";
import PostActions from "./PostActions";
import avatarImage from "@/public/Type.jpg";
import TextareaAutosize from "react-textarea-autosize";

interface Props {
  replyTo?: number;
  modal: boolean;
}

export default function Post({ replyTo, modal }: Props) {
  let placeholder = "What's happening?!";
  if (replyTo) placeholder = "Post your reply";

  return (
    <form
      className={`flex flex-col justify-between bg-black ${modal && "border-b border-b-border"} rounded-xl z-30`}
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
      <PostActions replyTo={replyTo} />
    </form>
  );
}
