import { IconType } from "react-icons";
import { RawTweet, Tweet } from "./tweets.types";
import { RawUser, User } from "./user.types";
import { FaHeart, FaQuoteRight, FaRegCommentDots } from "react-icons/fa6";
import { AiOutlineRetweet } from "react-icons/ai";

type NotificationType = "like" | "reply" | "retweet" | "quote" | "follow";

export type NotificationRaw = {
  id: string;
  type: NotificationType;
  created_at: string;
  is_read: boolean;
  tweet?: RawTweet;
  actor: RawUser;
};

export type Notification = {
  id: string;
  type: NotificationType;
  createdAt: string;
  isRead: boolean;
  tweet?: Tweet;
  actor: User;
};

interface NotificationConfig {
  icon: IconType;
  text: string;
  color: string;
}

export const notificationMap: Record<NotificationType, NotificationConfig> = {
  like: {
    icon: FaHeart,
    text: "liked your tweet",
    color: "text-red",
  },
  reply: {
    icon: FaRegCommentDots,
    text: "replied to your tweet",
    color: "text-blue",
  },
  retweet: {
    icon: AiOutlineRetweet,
    text: "reposted your tweet",
    color: "text-green",
  },
  quote: {
    icon: FaQuoteRight,
    text: "quoted your tweet",
    color: "text-green",
  },
  follow: {
    icon: FaHeart,
    text: "followed you",
    color: "text-red",
  },
};
