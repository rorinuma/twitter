"use client";

import PostActions from "./PostActions";
import avatarImage from "@/public/Type.jpg";
import TextareaAutosize from "react-textarea-autosize";
import clsx from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa6";
import { motion, useReducedMotion } from "motion/react";
import Avatar from "../ui/user/Avatar";
import SmallButton from "../ui/buttons/SmallButton";
import IconButton from "../ui/buttons/IconButton";
import ClientPortal from "../utility/ClientPortal";
import ErrorOverlay from "../shared/overlays/ErrorOverlay";
import { useSafeBack } from "@/hooks/goSafeBack";
import { ReplyPermission, ReplyPermissionType } from "@/types/post.types";
import { useSearchParams } from "next/navigation";
import Spinner from "../ui/decorations/Spinner";
import TweetCard from "@/components/tweets/index";
import { useTweet } from "@/hooks/useTweet";
import PostMedia from "./PostMedia";
import { useCreateTweet } from "@/hooks/useCreateTweet";
import { Tweet } from "@/types/tweets.types";

interface Props {
  modal: boolean;
  ref?: React.RefObject<HTMLFormElement | null>;
  replyTo?: string;
  quotedTweet?: Tweet;
}

export default function Post({ modal, ref, replyTo }: Props) {
  const [replyPermission, setReplyPermission] = useState<ReplyPermission>({
    type: ReplyPermissionType.Everyone,
  });
  const [text, setText] = useState<string>("");
  const [files, setFiles] = useState<File[] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const safeBack = useSafeBack("/home");
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const replyToParams = searchParams.get("replyTo");
  const quoteToParams = searchParams.get("quoteTo");

  const { data: replyTweet, isLoading: replyTweetLoading } = useTweet(
    replyToParams,
    !!replyToParams,
  );

  const { data: quotedTweet } = useTweet(quoteToParams, !!quoteToParams);

  const { mutate: postTweet } = useCreateTweet([
    "foryou",
    "following",
    "posts",
  ]);

  const shouldReduceMotion = useReducedMotion();

  const isDisabled = useMemo(() => {
    return text.trim().length === 0 && !files?.length;
  }, [text, files]);

  let placeholder = "What's happening?!";
  if (replyToParams || replyTo) placeholder = "Post your reply";
  if (quotedTweet) placeholder = "Add a comment";

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
      <PostMedia
        media={file}
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    postTweet({
      text,
      files,
      quoteTo: quoteToParams,
      replyTo: replyToParams ?? replyTo ?? undefined,
      mentionedUsers:
        replyPermission.type === ReplyPermissionType.Mentioned
          ? replyPermission.mentions
          : [],
      replyPermission: replyPermission.type,
    });

    setText("");
    setFiles(null);
    setReplyPermission({ type: ReplyPermissionType.Everyone });
  };

  const variants =
    shouldReduceMotion || !modal
      ? {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
      }
      : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
      };
  const transition =
    shouldReduceMotion || !modal ? { duration: 0 } : { duration: 0.3 };

  return (
    <>
      <motion.form
        className={clsx(`flex-col bg-black`, {
          "hidden xs:flex border-b border-b-border z-0": !modal,
          "flex rounded-2xl z-30 w-full max-w-[600px] min-h-[269px] grow shrink fixed top-0 xs:top-1/12":
            modal,
        })}
        ref={ref}
        onSubmit={handleSubmit}
        variants={variants}
        initial="initial"
        animate="animate"
        transition={transition}
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

        {replyToParams && (
          <div
            className={clsx("flex flex-1", {
              "items-center justify-center": replyTweetLoading,
            })}
          >
            {replyTweetLoading && <Spinner />}
            {replyTweet ? (
              <TweetCard tweet={replyTweet} variant="compose-reply" />
            ) : null}
          </div>
        )}

        <div className="flex flex-col flex-1 shrink grow justify-between">
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
              {quotedTweet && (
                <TweetCard tweet={quotedTweet} variant="compose-quote" />
              )}
            </div>
          </div>

          <PostActions
            replyTo={replyToParams ? replyToParams : replyTo}
            modal={modal}
            isPostDisabled={isDisabled}
            replyPermission={replyPermission}
            setReplyPermission={setReplyPermission}
            files={files}
            setFiles={setFiles}
          />
        </div>
      </motion.form>
      <ClientPortal>{error && <ErrorOverlay error={error} />}</ClientPortal>
    </>
  );
}
