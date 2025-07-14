import { RawUser, User } from "./user.types";

export interface Tweet {
  id: string;
  userId: string;
  content: string | null;
  inReplyToTweetId: string | null;
  originalTweetId: string | null;
  mediaURLs: string[] | null;
  repliesCount: number;
  likesCount: number;
  retweetsCount: number;
  viewsCount: number;
  bookmarksCount: number;
  createdAt: string;
  updatedAt: string;
  isLiked: boolean;

  user: User;

  replyTo: Tweet | null;

  replies: Tweet[] | null;
  thread: Tweet[] | null;

  retweetedTweet: Tweet | null;
  retweetedUsername?: string;
  quotedTweet: Tweet | null;
}

export interface RawTweet {
  id: string;
  user_id: string;
  content?: string | null;
  in_reply_to_tweet_id?: string | null;
  original_tweet_id?: string | null;
  media_urls?: string[] | null;
  replies_count: number;
  likes_count: number;
  retweets_count: number;
  views_count: number;
  bookmarks_count: number;
  created_at: string;
  updated_at: string;
  is_liked: boolean;

  user: RawUser;
  reply_to?: RawTweet | null;
  replies?: RawTweet[] | null;
  thread?: RawTweet[] | null;
  retweeted_tweet: RawTweet | null;
  quoted_tweet: RawTweet | null;
}

export interface TweetHoverProfileProps {
  tweet: Tweet;
  variant: TweetVariant;
  refs: {
    setFloating: (node: HTMLElement | null) => void;
  };
  getFloatingProps: () => React.HTMLAttributes<HTMLElement>;
  floatingStyles: React.CSSProperties;
  open: boolean;
}

export type TweetsType = "foryou" | "following" | "liked" | "posts" | "replies";

export type TweetVariant =
  | "default"
  | "status"
  | "reply"
  | "compose-reply"
  | "compose-quote"
  | "gallery";
