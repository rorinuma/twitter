"use client";

import { Tweet, TweetVariant } from "@/types/tweets.types";
import Avatar from "../ui/user/Avatar";
import image from "@/public/Type.jpg";
import { IoIosMore } from "react-icons/io";
import { MediaGrid } from "./MediaGrid";
import TweetActions from "./TweetActions";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import {
  useFloating,
  offset,
  flip,
  shift,
  useHover,
  useRole,
  useInteractions,
  autoUpdate,
} from "@floating-ui/react";
import { useParams, useRouter } from "next/navigation";
import Spinner from "../ui/decorations/Spinner";
import clsx from "clsx";
import Link from "next/link";
import TweetHoverProfile from "./TweetHoverProfile";
import { formatCompactTimeAgo, formatDateDetailed } from "@/lib/dates";
import GeneralTooltip from "../ui/decorations/GeneralTooltip";
import { useAuth } from "@/context/authContext";
import { FaRegTrashAlt } from "react-icons/fa";
import { IconContext } from "react-icons";
import { useCloseOnInteraction } from "@/hooks/modalClose";
import { useClickOutside } from "@/hooks/clickOutside";
import DeletePostOverlay from "./DeletePostOverlay";
import ErrorOverlay from "../shared/overlays/ErrorOverlay";
import { createPortal } from "react-dom";
import { AiOutlineRetweet } from "react-icons/ai";
import { useInView } from "react-intersection-observer";
import { addView } from "@/lib/queries/tweets.queries";

interface Props {
  tweet: Tweet | null;
  variant: TweetVariant;
  replyBar?: boolean;
  // loading is only for status. therefore when it's not needed/used it's null
  loading?: boolean | null;
}

export default function TweetCard({
  tweet: tweetToRender,
  variant,
  replyBar,
  loading = null,
}: Props) {
  const [open, setOpen] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isMoreOpen, setIsMoreOpen] = useState<boolean>(false);
  const [isPostDeletionVisible, setIsPostDeletionVisible] =
    useState<boolean>(false);
  const moreModalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const params = useParams<{ photoId: string }>();
  const shouldReduceMotion = useReducedMotion();
  const { user } = useAuth();

  const { ref: inViewRef, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });

  let tweet = tweetToRender;
  if (tweetToRender?.retweetedTweet) {
    tweet = tweetToRender.retweetedTweet;
    tweet.retweetedUsername = tweetToRender.user.username;
    tweet.retweetedId = tweetToRender.originalTweetId;
  }

  useCloseOnInteraction(isMoreOpen, () => setIsMoreOpen(false), {
    closeOnScroll: true,
    scrollThreshold: 200,
  });

  useClickOutside([moreModalRef], () => {
    isMoreOpen && setIsMoreOpen(false);
  });

  if (variant === "status") {
    console.log('variant === "status" isViewed', tweet?.isViewed);
  }

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError("");
      }, 3000);
    }
  }, [error]);

  useEffect(() => {
    if (inView && tweet?.id && !tweet.isViewed) {
      addView(tweet.id).catch((err) => {
        setError("Failed to add a view to the tweet");
        console.error("Failed to add a view to the tweet", err);
      });
    }
  }, [inView, tweet?.id]);

  const handleTweetClick = () => {
    if (
      variant === "compose-reply" ||
      (params.photoId && variant === "status")
    ) {
      return;
    }

    if (tweet) {
      router.push(`/status/${tweet.id}`);
    }
  };

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    middleware: [offset(8), flip(), shift()],
    placement: "bottom",
    strategy: "absolute",
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, {
    move: false,
    delay: { open: 250, close: 150 },
  });
  const role = useRole(context, { role: "tooltip" });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    role,
  ]);

  if (loading)
    return (
      <div className="flex w-full h-full items-center justify-center">
        <Spinner />
      </div>
    );
  if (loading === false && !tweet) return <div>Not found</div>;

  const variants = shouldReduceMotion
    ? {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
      }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
      };
  const transition = shouldReduceMotion ? { duration: 0 } : { duration: 0.3 };

  const handleDeletePostClick = () => {
    setIsPostDeletionVisible(true);
  };

  return (
    <>
      {tweet && (
        <div
          className={clsx("duration-(--hover-duration)", {
            "border-y border-y-border hover:bg-tweet-hover cursor-pointer w-full":
              variant === "default" && !replyBar,
            "hover:bg-tweet-hover": replyBar,
            "border border-border hover:bg-reply-tweet-hover hover:cursor-pointer rounded-2xl":
              variant === "reply" || variant === "compose-quote",
          })}
          onClick={(e) => {
            e.stopPropagation();
            handleTweetClick();
          }}
          ref={inViewRef}
        >
          <div
            className={clsx("flex flex-col mr-2 ml-3", {
              "mt-3": !tweet.retweetedUsername,
            })}
          >
            {tweet.retweetedUsername && (
              <div className="flex gap-1 items-center text-muted text-sm font-light">
                <span>
                  <AiOutlineRetweet />
                </span>
                <Link href={tweet.user.username}>
                  {`${tweet.retweetedUsername === user?.username ? "You" : tweet.user.username} reposted`}
                </Link>
              </div>
            )}
            <div className="flex gap-1">
              {variant !== "status" && (
                <button className="flex flex-col items-center gap-1 text-left">
                  <Link
                    href={`/${tweet.user.username}`}
                    className="w-10 h-10"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Avatar image={tweet.user.avatarURL || image} />
                  </Link>
                  {(variant === "compose-reply" || replyBar) && (
                    <div className="w-[1px] h-full bg-border"></div>
                  )}
                </button>
              )}

              <div className="flex flex-col grow">
                <div className="flex justify-between">
                  <div
                    className="flex gap-1 flex-wrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {variant == "status" && (
                      <div>
                        <Avatar image={tweet.user?.avatarURL || image} />
                      </div>
                    )}
                    <div
                      className={clsx("flex", {
                        "flex-col": variant == "status",
                        "gap-1": variant !== "status",
                      })}
                    >
                      <div
                        {...getReferenceProps()}
                        ref={(node) => {
                          if (variant !== "compose-reply") {
                            refs.setReference(node);
                          }
                        }}
                        className={clsx("flex gap-1 flex-wrap", {
                          "flex-col": variant === "status",
                        })}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span
                          className="font-semibold hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          {tweet.user?.displayName}
                        </span>
                        <span
                          className="text-muted font-light"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          @{tweet.user?.username}
                        </span>
                      </div>
                      {variant !== "status" && (
                        <GeneralTooltip
                          content={formatDateDetailed(tweet.createdAt)}
                        >
                          <span className="text-muted font-light">
                            {formatCompactTimeAgo(tweet.createdAt)}
                          </span>
                        </GeneralTooltip>
                      )}
                    </div>
                  </div>
                  {variant !== "compose-reply" &&
                    variant !== "reply" &&
                    variant !== "compose-quote" && (
                      <div
                        className="flex items-center justify-center relative"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <GeneralTooltip content="More" centered={true}>
                          <div className="h-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsMoreOpen((prev) => !prev);
                              }}
                              className="flex items-center justify-center hover:bg-nav-hover duration-(--hover-duration) rounded-full p-2"
                            >
                              <IoIosMore />
                            </button>
                          </div>
                        </GeneralTooltip>
                        {isMoreOpen && !isPostDeletionVisible && (
                          <motion.div
                            className="flex flex-col absolute -bottom-8 right-0 bg-background rounded-xl z-30 shadow-default cursor-pointer"
                            ref={moreModalRef}
                            variants={variants}
                            initial="initial"
                            animate="animate"
                            transition={transition}
                          >
                            <IconContext.Provider
                              value={{ className: "size-5" }}
                            >
                              {user?.username === tweet.user.username && (
                                <div
                                  className="flex gap-2 p-3 text-error items-center hover:bg-nav-hover rounded-xl duration-(--hover-duration)"
                                  onClick={handleDeletePostClick}
                                >
                                  <span>
                                    <FaRegTrashAlt />
                                  </span>
                                  <span>Delete</span>
                                </div>
                              )}
                            </IconContext.Provider>
                          </motion.div>
                        )}
                        {isPostDeletionVisible && (
                          <DeletePostOverlay
                            tweet={tweet}
                            setError={setError}
                            setIsVisible={setIsPostDeletionVisible}
                          />
                        )}
                      </div>
                    )}
                </div>

                {tweet.replyTo && variant === "compose-quote" && (
                  <div className="text-muted font-light mt-1">
                    Replying to @{tweet.replyTo.user.username}
                  </div>
                )}

                <div
                  className={clsx("mt-1", {
                    "mt-2": variant == "status",
                    "mb-2": variant === "reply" || variant === "compose-quote",
                  })}
                >
                  {tweet.content}
                </div>

                {tweet.mediaURLs &&
                  variant !== "compose-reply" &&
                  !params.photoId && (
                    <div className="mt-2 mb-1">
                      <MediaGrid media={tweet.mediaURLs} statusId={tweet.id} />
                    </div>
                  )}

                {tweet.mediaURLs && variant == "compose-reply" && (
                  <div>
                    {tweet.mediaURLs.map((url, i) => (
                      <div
                        key={i}
                        className="text-sm text-muted truncate max-w-[300px]"
                      >
                        {url.length > 50 ? `${url.slice(0, 50)}...` : url}
                      </div>
                    ))}
                  </div>
                )}

                {variant === "compose-reply" && (
                  <Link
                    href={`/${tweet.user.username}`}
                    className="my-2 font-light text-sm"
                  >
                    <span className="text-muted">
                      Replying to{" "}
                      <span className="text-blue">@{tweet.user.username}</span>
                    </span>
                    <span className="text-blue">
                      {tweet.thread?.map((tweet, i, arr) =>
                        i < 3 ? (
                          <span key={i}>
                            {i === 0 && ", "}@{tweet.user.username}
                            {arr.length - 1 != i && <span>,</span>}{" "}
                          </span>
                        ) : (
                          <span key={i}>...</span>
                        ),
                      )}
                    </span>
                  </Link>
                )}

                {tweet.replyTo &&
                  variant !== "compose-reply" &&
                  variant !== "compose-quote" && (
                    <div className="mt-2">
                      <TweetCard tweet={tweet.replyTo} variant="reply" />
                    </div>
                  )}

                {variant === "status" && (
                  <div className="mt-2 font-light text-sm">
                    <GeneralTooltip
                      content={formatDateDetailed(tweet.createdAt)}
                    >
                      <span className="text-muted hover:underline">
                        {formatDateDetailed(tweet.createdAt)}{" "}
                      </span>
                    </GeneralTooltip>
                    <span className="text-muted"> · </span>
                    <span>{tweet.viewsCount}</span>
                    <span className="text-muted"> · Views</span>
                  </div>
                )}

                {variant !== "compose-reply" &&
                  variant !== "compose-quote" &&
                  variant !== "reply" && (
                    <div className="mb-2">
                      <TweetActions
                        tweet={tweet}
                        repliesCount={tweet.repliesCount}
                        retweetsCount={tweet.retweetsCount}
                        likesCount={tweet.likesCount}
                        viewsCount={tweet.viewsCount}
                        bookmarksCount={tweet.bookmarksCount}
                        variant={variant}
                        setError={setError}
                      />
                    </div>
                  )}
              </div>
            </div>
          </div>

          <TweetHoverProfile
            tweet={tweet}
            variant={variant}
            refs={{ setFloating: refs.setFloating }}
            getFloatingProps={getFloatingProps}
            floatingStyles={floatingStyles}
            open={open}
          />
        </div>
      )}
      {error && createPortal(<ErrorOverlay error={error} />, document.body)}
    </>
  );
}
