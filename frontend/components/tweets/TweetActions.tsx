"use client";

import { FaRegComment } from "react-icons/fa";
import { AiOutlineRetweet } from "react-icons/ai";
import { FaRegHeart } from "react-icons/fa";
import { IoIosStats } from "react-icons/io";
import { FaRegBookmark } from "react-icons/fa";
import { IoShareSocialOutline } from "react-icons/io5";
import clsx from "clsx";
import { IconContext } from "react-icons";
import { useRouter } from "next/navigation";
import GeneralTooltip from "../ui/decorations/GeneralTooltip";
import { useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { motion } from "motion/react";
import { useClickOutside } from "@/hooks/clickOutside";
import { FaBookmark, FaHeart, FaPen } from "react-icons/fa6";
import axios from "axios";
import { Tweet } from "@/types/tweets.types";
import { useCreateRetweet } from "@/hooks/useCreateRetweet";
import { useAuth } from "@/context/authContext";
import { useDeleteRetweet } from "@/hooks/useDeleteRetweet";
import { useLikeTweet } from "@/hooks/useLikeTweet";
import { useUnlikeTweet } from "@/hooks/useUnlikeTweet";
import { useAddBookmark } from "@/hooks/useAddBookmark";
import { useDeleteBookmark } from "@/hooks/useDeleteBookmark";

interface Props {
  tweet: Tweet;
  repliesCount: number;
  retweetsCount: number;
  likesCount: number;
  viewsCount: number;
  bookmarksCount: number;
  variant: "default" | "status" | "gallery";
  setError: React.Dispatch<React.SetStateAction<string>>;
}

export default function TweetActions({
  tweet,
  repliesCount,
  retweetsCount,
  likesCount,
  viewsCount,
  bookmarksCount,
  variant,
  setError,
}: Props) {
  const router = useRouter();
  const [isRetweetModalVisible, setIsRetweetModalVisible] =
    useState<boolean>(false);
  const shouldReduceMotion = useReducedMotion();
  const retweetModalRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const { mutate: createRetweet } = useCreateRetweet([
    "posts",
    "foryou",
    "following",
  ]);
  const { mutate: deleteRetweet } = useDeleteRetweet([
    "posts",
    "foryou",
    "following",
  ]);

  const { mutate: likeTweet } = useLikeTweet([
    "replies",
    "liked",
    "following",
    "foryou",
    "posts",
  ]);

  const { mutate: unlikeTweet } = useUnlikeTweet([
    "replies",
    "liked",
    "following",
    "foryou",
    "posts",
  ]);
  const { mutate: addBookmark } = useAddBookmark([
    "replies",
    "liked",
    "following",
    "foryou",
    "posts",
  ]);
  const { mutate: deleteBookmark } = useDeleteBookmark([
    "replies",
    "liked",
    "following",
    "foryou",
    "posts",
  ]);

  useClickOutside([retweetModalRef], () => {
    setIsRetweetModalVisible(false);
  });

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

  const handleRetweetClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    const targetId = tweet.retweetedId ?? tweet.id;

    if (!isRetweeted) {
      createRetweet(targetId, {
        onError: (err) => {
          if (axios.isAxiosError(err)) {
            const message =
              err.response?.data?.message ||
              err.response?.data?.error ||
              err.response?.data ||
              "Failed to repost the tweet due to server error.";
            setError(message);
          } else {
            console.error("Non-Axios error when reposting tweet:", err);
            setError("An unexpected error occurred while reposting the tweet.");
          }
        },
      });
    } else {
      deleteRetweet(targetId, {
        onError: (err) => {
          if (axios.isAxiosError(err)) {
            const message =
              err.response?.data?.message ||
              err.response?.data?.error ||
              err.response?.data ||
              "Failed to delete the repost of the tweet due to server error.";
            setError(message);
          } else {
            console.error(
              "Non-Axios error when deleting a repost of the tweet:",
              err,
            );
            setError(
              "An unexpected error occurred while deleting a repost of the tweet.",
            );
          }
        },
      });
    }
    setIsRetweetModalVisible(false);
  };

  const handleLikeClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (!tweet.isLiked) {
      likeTweet(tweet.id, {
        onError: (err) => {
          if (axios.isAxiosError(err)) {
            const message =
              err.response?.data?.message ||
              err.response?.data?.error ||
              err.response?.data ||
              "Failed to like the tweet due to server error.";
            setError(message);
          } else {
            console.error("Non-Axios error when liking the tweet:", err);
            setError("An unexpected error occurred while liking the tweet.");
          }
        },
      });
    } else {
      unlikeTweet(tweet.id, {
        onError: (err) => {
          if (axios.isAxiosError(err)) {
            const message =
              err.response?.data?.message ||
              err.response?.data?.error ||
              err.response?.data ||
              "Failed to unlike the tweet due to server error.";
            setError(message);
          } else {
            console.error("Non-Axios error when unliking the tweet:", err);
            setError("An unexpected error occurred while unliking the tweet.");
          }
        },
      });
    }
  };

  const handleBookmarkClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (tweet.isBookmarked) {
      return deleteBookmark(tweet.id, {
        onError: (err) => {
          if (axios.isAxiosError(err)) {
            const message =
              err.response?.data?.message ||
              err.response?.data?.error ||
              err.response?.data ||
              "Failed to delete the bookmark due to server error.";
            setError(message);
          } else {
            console.error("Non-Axios error when deleting a bookmark:", err);
            setError("An unexpected error occurred while deleting a bookmark.");
          }
        },
      });
    }
    if (!tweet.isBookmarked) {
      return addBookmark(tweet.id, {
        onError: (err) => {
          if (axios.isAxiosError(err)) {
            const message =
              err.response?.data?.message ||
              err.response?.data?.error ||
              err.response?.data ||
              "Failed to add a bookmark due to server error.";
            setError(message);
          } else {
            console.error("Non-Axios error when adding a bookmark:", err);
            setError("An unexpected error occurred while adding a bookmark.");
          }
        },
      });
    }
  };

  const handleShareClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    const baseURL = process.env.NEXT_PUBLIC_FRONTEND_BASE_URL;
    navigator.clipboard.writeText(`${baseURL}/status/${tweet.id}`);
    setError("Tweet has been copied to clipboard");
  };

  const isRetweeted =
    tweet.retweetedUsername === user?.username || tweet.isRetweeted;

  return (
    <IconContext.Provider
      value={{
        className: `${(variant === "status" || variant === "gallery") && "size-5"} `,
      }}
    >
      <div
        className={clsx("flex justify-between mt-2", {
          "border-y border-y-border py-1": variant === "status",
          "lg:w-[50vw] w-[75vw]": variant === "gallery",
        })}
      >
        <GeneralTooltip content="Reply" centered={true}>
          <button
            type="button"
            className={clsx(
              "group flex text-muted items-center duration-(--hover-duration) ",
              {
                "hover:text-blue": variant !== "gallery",
                "text-white": variant === "gallery",
              },
            )}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/compose/post?replyTo=${tweet.id}`);
            }}
          >
            <div
              className={clsx(
                "flex items-center justify-center  p-2 rounded-full group-hover:bg-blue-hover duration-(--hover-duration)",
                {
                  "group-hover:bg-white-hover": variant === "gallery",
                },
              )}
            >
              <FaRegComment />
            </div>
            <div
              className={clsx("-ml-1 mt-[3px]", {
                "text-sm": variant !== "status",
              })}
            >
              {repliesCount || ""}
            </div>
          </button>
        </GeneralTooltip>
        <div className="flex justify-center items-center relative">
          <GeneralTooltip content="Repost" centered={true}>
            <button
              type="button"
              className={clsx(
                "group flex items-center duration-(--hover-duration) hover:text-green",
                {
                  "text-muted": variant !== "gallery" && !isRetweeted,
                  "text-white": variant === "gallery",
                  "text-green": isRetweeted,
                },
              )}
              onClick={(e) => {
                e.stopPropagation();
                setIsRetweetModalVisible((prev) => !prev);
              }}
            >
              <div
                className={clsx(
                  "flex items-center justify-center p-2 rounded-full group-hover:bg-green-hover duration-(--hover-duration)",
                )}
              >
                <AiOutlineRetweet />
              </div>
              <div
                className={clsx("-ml-1 mt-[3px]", {
                  "text-sm": variant !== "status",
                })}
              >
                {retweetsCount || ""}
              </div>
            </button>
          </GeneralTooltip>
          {isRetweetModalVisible && (
            <motion.div
              className="flex flex-col fixed bottom-0 font-semibold w-full h-fit left-1/2 max-xs:-translate-x-1/2  max-xs:p-3 max-xs:gap-2 xs:absolute xs:-bottom-10 xs:-left-16 xs:rounded-xl rounded-t-xl xs:w-fit shadow-default bg-background z-30"
              variants={variants}
              initial="initial"
              animate="animate"
              transition={transition}
              ref={retweetModalRef}
            >
              <button
                className="flex gap-2 items-center xs:justify-center text-nowrap rounded-t-xl p-2 hover:bg-nav-hover duration-(--hover-duration)"
                onClick={handleRetweetClick}
              >
                <div>
                  <AiOutlineRetweet />
                </div>
                <div>{isRetweeted ? "Undo Repost" : "Repost"}</div>
              </button>
              <button
                className="flex gap-2 items-center xs:justify-center rounded-b-xl p-2 hover:bg-nav-hover duration-(--hover-duration)"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRetweetModalVisible(false);
                  router.push(`/compose/post?quoteTo=${tweet.id}`);
                }}
              >
                <div>
                  <FaPen />
                </div>
                <div>Quote</div>
              </button>
              <button
                className="flex items-center justify-center xs:hidden border-border border w-full p-3 mb-2 mx-0 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRetweetModalVisible(false);
                }}
              >
                Cancel
              </button>
            </motion.div>
          )}
        </div>
        <GeneralTooltip content="Like" centered={true}>
          <button
            type="button"
            className={clsx(
              "group flex text-muted items-center duration-(--hover-duration)",
              {
                "hover:text-red": variant !== "gallery",
                "text-white": variant === "gallery",
                "text-red": variant !== "gallery" && tweet.isLiked,
              },
            )}
            onClick={handleLikeClick}
          >
            <div
              className={clsx(
                "flex items-center justify-center p-2 rounded-full group-hover:bg-red-hover duration-(--hover-duration)",
                {
                  "group-hover:bg-white-hover": variant === "gallery",
                },
              )}
            >
              {tweet.isLiked ? <FaHeart /> : <FaRegHeart />}
            </div>
            <div
              className={clsx("-ml-1 mt-[3px]", {
                "text-sm": variant !== "status",
              })}
            >
              {likesCount || ""}
            </div>
          </button>
        </GeneralTooltip>
        {variant !== "status" && (
          <GeneralTooltip content="View" centered={true}>
            <button
              type="button"
              className={clsx(
                "group flex text-muted items-center duration-(--hover-duration) hover:text-blue",
                {
                  "text-white": variant === "gallery",
                },
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center p-2 rounded-full group-hover:bg-blue-hover duration-(--hover-duration)">
                <IoIosStats />
              </div>
              <div className={clsx("-ml-1 mt-[3px] text-sm", {})}>
                {viewsCount || ""}
              </div>
            </button>
          </GeneralTooltip>
        )}
        <div className="flex">
          {variant !== "gallery" && (
            <GeneralTooltip content="Bookmark" centered={true}>
              <button
                type="button"
                className={clsx(
                  "hidden xs:flex group items-center duration-(--hover-duration) hover:text-blue",
                  {
                    "text-muted": !tweet.isBookmarked,
                    "text-blue": tweet.isBookmarked,
                  },
                )}
                onClick={handleBookmarkClick}
              >
                <div className="flex items-center justify-center p-2 rounded-full group-hover:bg-blue-hover duration-(--hover-duration)">
                  {tweet.isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
                </div>
                {variant === "status" && (
                  <div
                    className={clsx("-ml-1 mt-[3px]", {
                      "text-sm": variant !== "status",
                    })}
                  >
                    {bookmarksCount || ""}
                  </div>
                )}
              </button>
            </GeneralTooltip>
          )}
          {variant !== "status" && (
            <GeneralTooltip content="Share" centered={true}>
              <button
                type="button"
                className={clsx(
                  "group flex text-muted items-center duration-(--hover-duration)",
                  {
                    "hover:text-blue": variant !== "gallery",
                    "text-white": variant === "gallery",
                  },
                )}
                onClick={handleShareClick}
              >
                <div
                  className={clsx(
                    "flex items-center justify-center  -ml-1 p-2 rounded-full group-hover:bg-blue-hover duration-(--hover-duration)",
                    {
                      "group-hover:bg-white-hover": variant === "gallery",
                    },
                  )}
                >
                  <IoShareSocialOutline />
                </div>
              </button>
            </GeneralTooltip>
          )}
        </div>
        {variant === "status" && (
          <GeneralTooltip content="Share" centered={true}>
            <button
              type="button"
              className="group flex text-muted items-center duration-(--hover-duration) hover:text-blue"
              onClick={handleShareClick}
            >
              <div className="flex items-center justify-center  -ml-1 p-2 rounded-full group-hover:bg-blue-hover duration-(--hover-duration)">
                <IoShareSocialOutline />
              </div>
            </button>
          </GeneralTooltip>
        )}
      </div>
    </IconContext.Provider>
  );
}
