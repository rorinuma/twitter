import { RawTweet, Tweet } from "./tweets.types";
import { RawUser, User } from "./user.types";

export type NotificationRaw = {
  id: string;
  type: "like" | "reply" | "follow" | "retweet" | "quote";
  created_at: string;
  is_read: boolean;
  tweet?: RawTweet;
  actor: RawUser;
};

export type Notification = {
  id: string;
  type: "like" | "reply" | "follow" | "retweet" | "quote";
  createdAt: string;
  isRead: boolean;
  tweet?: Tweet;
  actor: User;
};
