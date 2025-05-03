"use client";

import Avatar from "@/app/components/Avatar";
import PostActions from "./PostActions";
import avatarImage from "@/public/Type.jpg";
import TextareaAutosize from "react-textarea-autosize";
import clsx from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";
import IconButton from "@/app/components/IconButton";
import { useSafeBack } from "@/app/hooks/goSafeBack";
import { ReplyPermission, ReplyPermissionType } from "@/app/types/postTypes";
import SmallButton from "@/app/components/SmallButton";
import PostImage from "./PostImage";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa6";

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
  const [files, setFiles] = useState<File[] | null>(null);
  const safeBack = useSafeBack();
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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

  const handleImageDelete = (index: number) => {
    setFiles((prev) => {
      if (!prev) {
        return [];
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const filePreviews = useMemo(() => {
    return (files || []).map((file, index) => (
      <PostImage
        image={file}
        index={index}
        key={index}
        handleImageDelete={handleImageDelete}
      />
    ));
  }, [files]);

  const updateScrollButtons = () => {
    const el = containerRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth);
  };

  const scrollByAmount = (amount: number) => {
    const el = containerRef.current;
    if (!el) return;

    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    updateScrollButtons();

    el.removeEventListener("scroll", updateScrollButtons);
    window.removeEventListener("resize", updateScrollButtons);
    el.addEventListener("scroll", updateScrollButtons);
    window.addEventListener("resize", updateScrollButtons);

    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [files]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const formData = new FormData();

    if (text) formData.append("text", text);
    if (files) {
      for (const file of files) {
        formData.append("files", file);
      }
    }
    if (replyPermission.type === ReplyPermissionType.Mentioned) {
      const mentions = replyPermission.mentions;
      for (const mentionedUser of mentions) {
        formData.append("mentionedUsers", mentionedUser);
      }
    }
    formData.append("replyPermission", replyPermission.type);
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
              bg="transparent"
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
          <div className="flex flex-col mt-3 max-h-[40rem] grow shrink overflow gap-2">
            <div className="min-h-5 max-h-[60%] ">
              <TextareaAutosize
                placeholder={placeholder}
                className="w-full outline-none resize-none scroll-smooth no-scrollbar"
                value={text}
                maxLength={500}
                onChange={(e) => setText(e.target.value)}
                maxRows={15}
              />
            </div>

            <div className="flex relative flex-1 overflow-y-auto no-scrollbar">
              {filePreviews.length > 0 && (
                <div
                  className="flex gap-2 scroll-smooth overflow-x-auto no-scrollbar"
                  ref={containerRef}
                >
                  {filePreviews}
                </div>
              )}

              {canScrollRight && (
                <div
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 overflow-visible"
                  onClick={() => scrollByAmount(200)}
                >
                  <IconButton bg="blurred" icon={<FaArrowRight />} />
                </div>
              )}
              {canScrollLeft && (
                <div
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 overflow-visible"
                  onClick={() => scrollByAmount(-200)}
                >
                  <IconButton bg="blurred" icon={<FaArrowLeft />} />
                </div>
              )}
            </div>
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
