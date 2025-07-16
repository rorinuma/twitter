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
import { FaPen } from "react-icons/fa6";
import axios from "axios";
import api from "@/lib/axios";
import { Tweet } from "@/types/tweets.types";
import { useCreateRetweet } from "@/hooks/useCreateRetweet";
import { useAuth } from "@/context/authContext";
import { useDeleteRetweet } from "@/hooks/useDeleteRetweet";

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

  useClickOutside([retweetModalRef], () => {
    setIsRetweetModalVisible(false);
  });

  const variants = shouldReduceMotion
    ? {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
    }
    : {
      initial: { height: 0, opacity: 0 },
      animate: { height: "fit-content", opacity: 1 },
    };
  const transition = shouldReduceMotion ? { duration: 0 } : { duration: 0.3 };

  const handleRetweetClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    const targetId = tweet.retweetedId ?? tweet.id;

    if (!isRetweeted) {
      createRetweet(targetId, {
        onSuccess: () => {
          setError("Tweet successfully retweeted");
        },
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
        onSuccess: () => {
          setError("Retweet successfully deleted");
        },
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

    try {
      const { data } = await api.post(`/protected/tweets/like/${tweet.id}`, {});
      setError(data.message);
    } catch (err) {
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
    }
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
        {/* TODO: retweets  (undo repost) */}
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
            {/* TODO: same with like/unlike */}
          </GeneralTooltip>
          {isRetweetModalVisible && (
            <motion.div
              className="flex flex-col absolute bottom-0 left-0 rounded-xl w-fit shadow-default bg-background z-30"
              variants={variants}
              initial="initial"
              animate="animate"
              transition={transition}
              ref={retweetModalRef}
            >
              <button
                className="flex gap-2 items-center justify-center rounded-t-xl p-2 hover:bg-nav-hover duration-(--hover-duration)"
                onClick={handleRetweetClick}
              >
                <div>
                  <AiOutlineRetweet />
                </div>
                <div>{isRetweeted ? "Undo Repost" : "Repost"}</div>
              </button>
              <button
                className="flex gap-2 items-center justify-center rounded-b-xl p-2 hover:bg-nav-hover duration-(--hover-duration)"
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
              {<FaRegHeart />}
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
          {/* TODO: same here */}
          {variant !== "gallery" && (
            <GeneralTooltip content="Bookmark" centered={true}>
              <button
                type="button"
                className="hidden xs:flex group text-muted items-center duration-(--hover-duration) hover:text-blue"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-center p-2 rounded-full group-hover:bg-blue-hover duration-(--hover-duration)">
                  <FaRegBookmark />
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
                onClick={(e) => e.stopPropagation()}
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
              onClick={(e) => e.stopPropagation()}
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
